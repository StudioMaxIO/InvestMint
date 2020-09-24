const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const tokenFilename = "SMToken.sol";
const tokenPath = path.resolve(__dirname, "contracts", tokenFilename);
const tokenSource = fs.readFileSync(tokenPath, "utf8");

var input = {
  language: "Solidity",
  sources: {
    "SMToken.sol": {
      content: tokenSource
    }
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"]
      }
    }
  }
};

const tokenOutput = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
  tokenFilename
];

fs.ensureDirSync(buildPath);

for (let contract in tokenOutput) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract + ".json"),
    tokenOutput[contract]
  );
}
