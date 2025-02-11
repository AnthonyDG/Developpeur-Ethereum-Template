const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
     development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
     },  
     ropsten:{
      provider : function() {return new HDWalletProvider({
        mnemonic:{phrase:`${process.env.MNEMONIC}`},
        providerOrUrl:`https://ropsten.infura.io/v3/${process.env.INFURA_ID}`,
        addressIndex: 0,
      })},
      network_id:3,
    },
    kovan:{
      provider : function() {return new HDWalletProvider({
        mnemonic:{phrase:`${process.env.MNEMONIC}`},
        providerOrUrl:`https://kovan.infura.io/v3/${process.env.INFURA_ID}`
      })},
      network_id:42,
    },
  },
  plugins: ["solidity-coverage"],

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
    reporter: 'eth-gas-reporter',
      reporterOptions : { 
      gasPrice:1,
      token:'ETH',
      showTimeSpent: true,
    }
  },

  compilers: {
    solc: {
      version: "0.8.14",      // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
       settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: false,
          runs: 200
        },
      //  evmVersion: "byzantium"
       }
    }
  },
};