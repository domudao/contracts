import { Contract, ContractFactory } from "ethers";
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, upgrades } from "hardhat";
// import addresses from "./addresses";

async function main(): Promise<void> {
  // const paramAddresses = addresses.networks.bsct;

  // Hardhat always runs the compile task when running scripts through it.
  // If this runs in a standalone fashion you may want to call compile manually
  // to make sure everything is compiled
  // await run("compile");

  // We get the contract to deploy    
    const tokenCreator:ContractFactory = await ethers.getContractFactory("TokenProxy")
    const tokenProxy:Contract = await tokenCreator.deploy()
    await tokenProxy.deployed()

    const TestNFT:ContractFactory = await ethers.getContractFactory("TestNFT")
    const testNFT = await TestNFT.deploy()
    await testNFT.deployed()

    const domu:ContractFactory = await ethers.getContractFactory("DOMU")
    const domuToken = await domu.deploy()
    await domuToken.deployed()

    const ElectricDataLand: ContractFactory = await ethers.getContractFactory("ElectricDataLand");
    const electricDataLand: Contract = await upgrades.deployProxy(ElectricDataLand, [
        domuToken.address,
        testNFT.address,
        tokenProxy.address
    ]);
    
    console.log("Token proxy deployed at", tokenProxy.address, "main contract deployed at ", electricDataLand.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
