import web3 from "./web3";
import InvestMint from "./build/InvestMint.json";

export default address => {
  return new web3.eth.Contract(InvestMint.abi, address);
};
