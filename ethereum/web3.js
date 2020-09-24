import Web3 from "web3";
//const credentials = require("../settings/credentials");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

let web3;

if (typeof window !== "undefined" && typeof window.web3 !== "undefined") {
  // in browser and metamask is running
  web3 = new Web3(window.ethereum);
  window.ethereum.enable();
} else {
  // on the server or user is not running metamask
  const provider = new Web3.providers.HttpProvider(process.env.INFURA_API);
  web3 = new Web3(provider);
}

export default web3;
