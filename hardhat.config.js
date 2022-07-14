require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");

const fs = require("fs");

const privateKey = fs.readFileSync(".secret").toString().trim();

const AVALANCHE_TESTNET = "https://api.avax-test.network/ext/bc/C/rpc";
const POLYGON_TESTNET = "https://rpc-mumbai.maticvigil.com/";

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    avalanche_testnet: {
      url: AVALANCHE_TESTNET,
      accounts: [privateKey],
    },
    polygon_testnet: {
      url: POLYGON_TESTNET,
      accounts: [privateKey],
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
