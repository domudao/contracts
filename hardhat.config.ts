import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-watcher";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";
import "@openzeppelin/hardhat-defender";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-web3-legacy";

import "./tasks/accounts";
import "./tasks/clean";

import { resolve } from "path";

import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const chainIds = {
  ganache: 1337,
  goerli: 5,
  sepolia: 11155111,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
  bsc: 56,
  bsct: 97,
};

// Ensure that we have all the environment variables we need.
let mnemonic_mainnet: string;
let mnemonic_testnet: string;
if (!process.env.MNEMONIC_MAINNET || !process.env.MNEMONIC_TESTNET) {
  throw new Error("Please set your MNEMONIC in a .env file");
} else {
  mnemonic_mainnet = process.env.MNEMONIC_MAINNET;
  mnemonic_testnet = process.env.MNEMONIC_TESTNET;
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      accounts: {
        mnemonic: mnemonic_mainnet,

      },
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/BCNbfMg2LzXngd0f-2g0oZzSYiamJko9",
        blockNumber: 12148212
      },
      chainId: chainIds.mainnet,
    },
    bsc: {
      accounts: {
        mnemonic: mnemonic_mainnet,
      },
      url: "https://bsc-dataseed.binance.org/",
      chainId: chainIds.bsc,
    },
    bsct: {
      accounts: {
        mnemonic: mnemonic_testnet,
      },
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: chainIds.bsct,
    },
    goerli:{
      accounts:{
        mnemonic: mnemonic_testnet,
    },
    url: `https://goerli.infura.io/v3/${process.env.INFURA_API}`,
    chainId: chainIds.goerli,
    },
    sepolia:{
      accounts:{
        mnemonic: mnemonic_testnet,
    },
    url: `https://sepolia.infura.io/v3/${process.env.INFURA_API}`,
    chainId: chainIds.sepolia,
    },
    rinkeby:{
      accounts:{
        mnemonic: mnemonic_testnet,
    },
    url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API}`,
    chainId: chainIds.rinkeby,
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    compilers:[
      {
      version: "0.8.16",
      settings: {
        metadata: {
          // Not including the metadata hash
          // https://github.com/paulrberg/solidity-template/issues/31
          bytecodeHash: "none",
        },
        // You should disable the optimizer when debugging
        // https://hardhat.org/hardhat-network/#solidity-optimizer-support
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
    {
      version: "0.8.2",
      settings: {
        metadata: {
          // Not including the metadata hash
          // https://github.com/paulrberg/solidity-template/issues/31
          bytecodeHash: "none",
        },
        // You should disable the optimizer when debugging
        // https://hardhat.org/hardhat-network/#solidity-optimizer-support
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
    {
      version: "0.7.6",
    }
    ]
  },
  etherscan:{
    apiKey: process.env.API_KEY
  },
  mocha: {
    timeout: 200000,
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  watcher: {
    test: {
      tasks: [{ command: "test", params: { testFiles: ["{path}"] } }],
      files: ["./test/**/*"],
      verbose: true,
    },
  },
  defender: {
    apiKey: process.env.DEFENDER_API_KEY || "",
    apiSecret: process.env.DEFENDER_API_SECRET_KEY || "",
  },
};

export default config;
