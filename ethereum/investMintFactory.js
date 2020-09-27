import web3 from "./web3";
import InvestMintFactory from "./build/InvestMintFactory.json";
const f = require("../settings/factories");

const investMintFactoryAddress = f.INVESTMINT_FACTORY_ADDRESS;

const factory = new web3.eth.Contract(
  InvestMintFactory.abi,
  investMintFactoryAddress
);

export default factory;
