require("@nomiclabs/hardhat-waffle");





const avalanche_testnet = 'https://api.avax-test.network/ext/bc/C/rpc';
const polygon_testnet='https://rpc-mumbai.maticvigil.com/';



module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    avalanche_testnet: {
      url: avalanche_testnet,
      accounts: [privateKey],
    },
    polygon_testnet:{
      url: polygon_testnet,
      accounts:[privateKey],
    },
  },
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
