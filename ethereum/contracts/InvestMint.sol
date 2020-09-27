pragma solidity ^0.6.2;

import "https://github.com/smartcontractkit/chainlink/evm-contracts/src/v0.6/ChainlinkClient.sol";
import "https://github.com/smartcontractkit/chainlink/evm-contracts/src/v0.6/vendor/Ownable.sol";
import "./SMToken.sol";

contract InvestMint is Token, ChainlinkClient, Ownable {

    enum ReservationStatus { open, claimed, canceled, expired }

    enum Operand { multiply, divide, power, add, subtract }

    struct Reservation {
        uint id;
        uint purchasedID;
        address payable buyerAddress;
        ReservationStatus status;
        uint cost; // in wei
        uint expiration;
        bool finalized;
    }

    mapping(address => uint) public linkBalance;

    uint private _vPool = 0;
    uint private _vSupply = 0;

    // this provides lowest known # blocks reeserved, updated when reservations are updated
    uint private _blocksReserved = 0;

    uint[] private _claimedReservations;
    uint private _currentID = 0;
    uint private _totalReservations = 0;
    uint private _maxVerifiedID = 0;

    uint private _nextUpdate = 0;
    uint private _canceledTasksAvailable = 0;
    uint private _expiredTasksAvailable = 0;
    uint private _pendingPool = 0;

    //Must authorize contract to spend LINK tokens for user in order to make reservation
    uint public reservationFee = 1 * (10**18); // Reservation Fee in LINK
    uint public expirationPeriod = 24 hours;

    uint public tokensPerBlock = 1000 * (10**18);

    mapping(uint => Reservation) private _reservations;
    mapping(address => uint) private _activeReservation;

    uint oraclePayment = (1 * (10**18)) / 2;

    uint private _mintFeeValue1 = 0; // 0 represents # of current block
    uint private _mintFeeValue2 = 1000; // Represents Ether, not wei (remember to adjust in calculations)
    Operand private _mintFeeOperand = Operand.divide;

    uint private _blocksToStabilize = 0;
    uint public _stableMintFee = 0;

    //TESTING VARIABLES

    // Kovan
    bytes32 jobID = "a7ab70d561d34eb49e9b1612fd2e044b";
    address oracleAddress = 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e;
    address linkTokenAddress = 0xa36085F69e2889c224210F603D836748e7dC0088;

    // Mainnet
    //bytes32 jobID = "";
    //address oracleAddress = ;
    //address linkTokenAddress = 0xa36085F69e2889c224210F603D836748e7dC0088;


    constructor(string memory tokenName, string memory tokenSymbol, uint mintFeeV1, string memory operand, uint mintFeeV2, uint blocksToStabilize, uint stableMintFee, uint tokensInBlock, uint expiration ) Token(tokenName, tokenSymbol, 0, 18) public {
        setPublicChainlinkToken();

        _mintFeeValue1 = mintFeeV1;
        _mintFeeValue2 = mintFeeV2;
        tokensPerBlock = tokensInBlock;
        expirationPeriod = expiration;

        // set operand
        bytes32 hashedOperand = keccak256(abi.encodePacked(operand));
        if(hashedOperand == keccak256(abi.encodePacked("*"))){
            _mintFeeOperand = Operand.multiply;
        } else if (hashedOperand == keccak256(abi.encodePacked("/"))){
            _mintFeeOperand = Operand.divide;
        } else if (hashedOperand == keccak256(abi.encodePacked("^"))){
            _mintFeeOperand = Operand.power;
        } else if (hashedOperand == keccak256(abi.encodePacked("+"))){
            _mintFeeOperand = Operand.add;
        } else if (hashedOperand == keccak256(abi.encodePacked("-"))){
            _mintFeeOperand == Operand.subtract;
        }

        _blocksToStabilize = blocksToStabilize;
        _stableMintFee = stableMintFee;
    }

    receive() external payable {
        addToVPool(msg.value);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getActiveReservation() public view returns (uint) {
        return _activeReservation[msg.sender];
    }

    function isAuthorizedForReservation() public view returns (bool) {
        return (Token(linkTokenAddress).allowance(msg.sender, address(this)) >= reservationFee);
    }

    function getSummary() public view returns (string memory, string memory, uint, uint, uint) {
        // name, symbol, tokensPerBlock, currentBlockCost
        uint cost = getCostOfReservation();
        uint tokenValue = getTokenValue();
        return (_name, _symbol, tokensPerBlock, cost, tokenValue);
    }

    function getReservationSummary(uint reservationID) public view returns(uint256, ReservationStatus, uint256, uint256, bool){
        Reservation memory r = _reservations[reservationID];
        ReservationStatus s = r.status;
        if (r.expiration < now) {
            s = ReservationStatus.expired;
        }
        return (r.id, s, r.cost, r.expiration, r.finalized);
    }

    function reserveBlock() public {
        // check for existing reservation
        require((_reservations[_activeReservation[msg.sender]].expiration < now) || (_activeReservation[msg.sender] == 0));

        Token linkToken = Token(linkTokenAddress);

        // make sure reservation fee is available
        require(linkToken.allowance(msg.sender, address(this)) >= reservationFee);
        require(linkToken.balanceOf(msg.sender) >= reservationFee);

        // transfer LINK to this contract from sender
        linkToken.transferFrom(msg.sender, address(this), reservationFee);

        linkBalance[msg.sender] += reservationFee;

        // create reservation for user
        createReservation();

    }

    function createReservation() internal {
        _currentID++;
        uint totalCost = getCostOfReservation();
        Reservation memory newReservation = Reservation ({
            id: _currentID,
            purchasedID: _blocksReserved + 1,
            buyerAddress: msg.sender,
            status: ReservationStatus.open,
            cost: totalCost,
            expiration: now + expirationPeriod,
            finalized: false
        });
        _reservations[newReservation.id] = newReservation;
        _activeReservation[msg.sender] = newReservation.id;
        addToVPool(totalCost);
        addToVSupply(tokensPerBlock);
        _blocksReserved++;
        _totalReservations++;
    }

    function getCostOfReservation() public view returns(uint) {
        uint currentTokenCost = getVTokenCost(18);
        uint currentFee = getMintFee(_blocksReserved + 1);
        uint totalCost = (currentTokenCost * (tokensPerBlock / (10**18))) + currentFee;
        return totalCost;
    }

    function getMintFee(uint numBlocks) public view returns(uint) {
        uint fee = _stableMintFee;
        if(numBlocks < _blocksToStabilize) {
            uint v1 = _mintFeeValue1;
            uint v2 = _mintFeeValue2;

            if (_mintFeeValue1 == 0) {
                v1 = numBlocks;
            }

            if (_mintFeeValue2 == 0) {
                v2 = numBlocks;
            }

            // v1 * v2 stored as ether values, fees converted to wei here
            if (_mintFeeOperand == Operand.multiply) {
                fee = (v1 * v2) * (10 ** 18);
            } else if (_mintFeeOperand == Operand.divide) {
                fee = ((v1*(10 ** 18)) / v2);
            } else if (_mintFeeOperand == Operand.power) {
                fee = (v1 ** v2) * (10 ** 18);
            } else if (_mintFeeOperand == Operand.add) {
                fee = (v1 + v2) * (10 ** 18);
            } else if (_mintFeeOperand == Operand.subtract) {
                if (v1 >= v2) {
                    fee = (v1 - v2) * (10 ** 18);
                }
            }
        }

        return fee;
    }

    function getVTokenCost(uint decimals) public view returns(uint) {
        uint adjustedVCost = 0;
        if (_vSupply != 0) {
            adjustedVCost = _vPool * (10 ** decimals) / _vSupply;
        }
        return adjustedVCost;
    }

    function getTokenValue() public view returns(uint) {
        uint adjustedValue = 0;
        if (_totalSupply != 0) {
            if (address(this).balance > _pendingPool) {
                adjustedValue = (address(this).balance - _pendingPool) * (10**18) / _totalSupply;
            }
        }
        return adjustedValue;
    }

    function addToPool() public payable {
        _vPool += msg.value;
    }

    function addToVPool(uint weiValue) internal {
        _vPool += weiValue;
    }

    function addToVSupply(uint numTokens) internal {
        _vSupply += numTokens;
    }

    function removeFromVPool(uint weiValue) internal {
        if (_vPool >= weiValue) {
            _vPool -= weiValue;
        } else {
            _vPool = 0;
        }
    }

    function removeFromVSupply(uint numTokens) internal {
        if (_vSupply >= numTokens) {
            _vSupply -= numTokens;
        } else {
            _vSupply = 0;
        }
    }

    function purchaseBlock() public payable{
        Reservation storage res = _reservations[_activeReservation[msg.sender]];

        // reservation is open
        require(res.status == ReservationStatus.open);

        // reservation isn't expired
        require(res.expiration > now, "Reservation is expired.");

        // sender sent enough to cover cost of reservation
        require(msg.value >= res.cost);

        // update reservation info
        res.status = ReservationStatus.claimed;
        delete _activeReservation[msg.sender];
        //_purchasedReservations.push(res.id);
        _pendingPool += res.cost;
        if(res.cost < msg.value) {
            msg.sender.transfer(msg.value - res.cost);
        }

        if (_nextUpdate < res.expiration) {
            updateReservationsAfterDelay(expirationPeriod);
            _nextUpdate = now + expirationPeriod;

        // Use canceled or expired task credit if available
            if (_canceledTasksAvailable >= 1) {
                _canceledTasksAvailable--;
                refundFullReservationFee();
            } else if (_expiredTasksAvailable >= 1) {
                _expiredTasksAvailable--;
                refundFullReservationFee();
            } else {
                refundPartialReservationFee();
            }
        } else {
            refundFullReservationFee();
        }
    }

    function cancelBlock() public {
        Reservation storage res = _reservations[_activeReservation[msg.sender]];

        // only cancel open reservations
        require(res.status == ReservationStatus.open);

        // reservation not expired
        require(res.expiration > now);

        res.status = ReservationStatus.canceled;

        delete _activeReservation[msg.sender];

        refundPartialReservationFee();

        _canceledTasksAvailable++;
    }

    function refundFullReservationFee() internal {
        if(linkBalance[msg.sender] >= reservationFee) {
            Token(linkTokenAddress).transfer(msg.sender, reservationFee);
        }
    }

    function refundPartialReservationFee() internal {
        // should refund deposit minus cost of running 1 ChainLink job
        if(linkBalance[msg.sender] >= (reservationFee / 2)) {
            Token(linkTokenAddress).transfer(msg.sender, (reservationFee / 2));
        }
    }

    function updateReservations() public {
        //uint maxUpdate = maxUpdateID == 0 ? _totalReservations : maxUpdateID + 1;
        for (uint i = _maxVerifiedID + 1; i < _totalReservations + 1; i++){
            Reservation storage r = _reservations[i];
            if(r.status == ReservationStatus.claimed) {

                if (!r.finalized){
                    _claimedReservations.push(r.id);
                    if(_pendingPool >= r.cost) {
                        _pendingPool -= r.cost;
                    }
                    if(r.purchasedID > _claimedReservations.length) {
                        // update to open reservation
                        r.purchasedID = _claimedReservations.length;

                        // remove existing "purchase" from vpool / vsupply
                        removeFromVPool(r.cost);
                        removeFromVSupply(tokensPerBlock);

                        uint originalCost = r.cost;
                        uint currentTokenCost = getVTokenCost(18);
                        uint finalFee = getMintFee(r.purchasedID);
                        uint newCost = (currentTokenCost * (tokensPerBlock / (10**18))) + finalFee;
                        _blocksReserved--;
                        // update vPool / vSupply to new values
                        addToVPool(newCost);
                        addToVSupply(tokensPerBlock);

                        // refund difference
                        if (newCost < originalCost) {
                            uint difference = originalCost - newCost;
                            r.cost = newCost;
                            if(address(this).balance > difference){
                                r.buyerAddress.transfer(difference);
                            }
                        }
                    }
                    r.finalized = true;

                    //Tokens are minted and available at user's address
                    _mint(r.buyerAddress, tokensPerBlock);
                    _maxVerifiedID = r.id;
                }
            } else if(r.status == ReservationStatus.open) {
                // should not update past reservations that are open unless expired
                if(r.expiration < now) {
                    // update to expired state
                    r.status = ReservationStatus.expired;
                    // handle expired reservation
                    removeFromVSupply(tokensPerBlock);
                    removeFromVPool(r.cost);
                    _blocksReserved--;
                    r.finalized = true;
                    delete _activeReservation[r.buyerAddress];
                    _maxVerifiedID = r.id;
                    _expiredTasksAvailable++;
                    updateReservationsAfterDelay(60);
                }
                return;
            } else if(r.status == ReservationStatus.canceled) {
                if (!r.finalized) {
                    removeFromVSupply(tokensPerBlock);
                    removeFromVPool(r.cost);
                    _blocksReserved--;
                    r.finalized = true;
                    _maxVerifiedID = r.id;
                }
            } else if(r.status == ReservationStatus.expired) {
                if (!r.finalized) {
                    removeFromVSupply(tokensPerBlock);
                    removeFromVPool(r.cost);
                    _blocksReserved--;
                    r.finalized = true;
                    delete _activeReservation[r.buyerAddress];
                    _maxVerifiedID = r.id;
                    _expiredTasksAvailable++;
                    updateReservationsAfterDelay(1);
                    return;
                }
            }
        }

    }

    function exchangeTokens(uint amount) public {
        require(_balances[msg.sender] >= amount);
        uint tokenValue = getTokenValue();
        uint ev = tokenValue * amount / (10 ** 18);
        removeFromVSupply(amount);
        removeFromVPool(ev);
        require(address(this).balance >= ev);
        msg.sender.transfer(ev);
        _burn(msg.sender, amount);
    }

    function updateReservationsAfterDelay(uint delay) public {
        Chainlink.Request memory req = buildChainlinkRequest(jobID, address(this), this.updateExpiredReservations.selector);
        req.addUint("until", now + delay);
        sendChainlinkRequestTo(oracleAddress, req, oraclePayment);
    }

    function updateExpiredReservations(bytes32 _requestId) public recordChainlinkFulfillment(_requestId){
        updateReservations();
    }
}


contract InvestMintFactory{
    address[] public tokens;

    function createToken(string memory name, string memory symbol, uint mintFeeV1, string memory operand, uint mintFeeV2, uint blocksToStabilize, uint stableMintFee, uint tokensInBlock, uint expiration) public returns(address){
        address newToken = address(new InvestMint (name, symbol, mintFeeV1, operand, mintFeeV2, blocksToStabilize, stableMintFee, tokensInBlock, expiration));
        tokens.push(newToken);
        return newToken;
    }

    function getTokens() public view returns (address[] memory){
        return tokens;
    }
}
