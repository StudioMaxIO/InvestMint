# InvestMint

A Mintable Fundraising Token for No-Loss Investments

InvestMint is an ERC-20 token with automatic price adjustment and a built-in liquidity pool / exchange.

Token holders are incentivized to hold onto their tokens and benefit when others exchange (burn) their tokens. This makes for a great fundraising situation where the issuer of the coin may initially purchase some blocks, then after investors mint some tokens, the issuer burns some of theirs to cover startup expenses. The investors hold their tokens until the value is appropriate for their exchange / burn.

Value of the tokens increases whenever new blocks are purchased or when deposits are made to the liquidity pool. One major incentive for investors in a fundraising token could be the issuer promises to return some percentage of profits back into the liquidity pool, thus providing an increase in value to any token holders. If for any reason they were unable to contribute, the value of the tokens may not increase, but they will never go down.

As tokens are sold, as long as at least 1 token exists, value of all tokens will never decrease, regardless of the number being minted or burned.

Once an InvestMint token contract has been created, anyone with the address can mint blocks for a fee and exchange them for the current value at any point. The price is always fair and if any previous blocks are canceled or expired after a subsequent block is purchased, the purchaser will receive a refund of the cost difference as if they had purchased the lowest cost unclaimed block.

Reservation Fee of 1 LINK is required to reserve block of coins. Up to the full reservation fee will be refunded once the block is purchased. Half of the reservation fee may be kept in the contract depending on how many existing LINK remain in the contract at the time of purchase.

This current version of InvestMint is only on the Kovan test network. While this is a functioning contract and dApp, it has not been audited for security and is only a proof of concept at this stage.

To run locally, clone project and "npm run dev" from the root directory. A live test version can be accessed at http://investmint.herokuapp.com
