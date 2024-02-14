Domudao/contracts

This is the smart contract work done by Tomislav

Deployed to Sepolia at
https://sepolia.etherscan.io/address/0x41Ec7D68F3ED1C4C3fB8cf3Ede2e01f26FBEAcF1#code

---


Install dependencies by running:
yarn or yarn install

Modify the .env file. Add infura key, bscscan key for contract verification and wallet mnemonic for testnet and mainnet. 

Compile contracts by running:
npx hardhat compile

Run tests by running:
npx hardhat test

Deploy contracts on binance smart chain by running:
npx hardhat run --network bsct .\scripts\deployEDL.ts
