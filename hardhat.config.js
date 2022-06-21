require("@nomiclabs/hardhat-waffle");




const privateKey = "8f08163b546b6ab992d8d21a58d873fbb642f29198b2f0781fd8b3bdf7539336";
const RPC_PROVIDER = 'https://api.avax-test.network/ext/bc/C/rpc';


module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    testnet: {
      url: RPC_PROVIDER,
      accounts: [privateKey],
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
