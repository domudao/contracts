import hre, { ethers } from "hardhat";

export const unlockAccount = async (address: string) => {
  await hre.network.provider.send("hardhat_impersonateAccount", [address]);
  return address;
};

export const increaseTime = async (sec: number) => {
  await hre.network.provider.send("evm_increaseTime", [sec]);
  await hre.network.provider.send("evm_mine");
};

export const mineBlocks = async (blockCount: number) => {
  for (let i = 0; i < blockCount; ++i) {
    await hre.network.provider.send("evm_mine");
  }
};

export const getBlockNumber = async () => {
  const blockNumber = await hre.network.provider.send("eth_blockNumber");
  return parseInt(blockNumber.slice(2), 16);
};

export const getTimeStamp = async () => {
  const blockNumber = await hre.network.provider.send("eth_blockNumber");
  const blockTimestamp = (await hre.network.provider.send("eth_getBlockByNumber", [blockNumber, false])).timestamp;
  return parseInt(blockTimestamp.slice(2), 16);
};

export const getSnapShot = async () => {
  return await hre.network.provider.send("evm_snapshot");
};

export const revertEvm = async (snapshotID: any) => {
  await hre.network.provider.send("evm_revert", [snapshotID]);
};

export const getValidators = (validatorList:any, addressList:any, signerAddressList:any) =>{
  //[alice.address, bob.address, john.address, tom.address, mike.address]
  let addresses = []
  let signersAddresses = []

  for (let j = 0; j<3;j++){
    for (let i = 0; i<addressList.length;i++){
      if (validatorList[j] == addressList[i]){
          signersAddresses.push(signerAddressList[i])
          addresses.push(validatorList[j])
      }
    }
  }

  return [signersAddresses , addresses]

}

export const findFakeValidator = (validatorList:any, addressList:any, signerAddressList:any)=>{

  let address
  let signerAddress
  let state = false;
 
  for (let i = 0; i < addressList.length;i++){
    state= false;
    for (let j = 0; j<3;j++){
      if (validatorList[j] != addressList[i]){
        signerAddress = signerAddressList[i]
        address = addressList[i]
        if (j==2){
          state = false;
          break
          }
        }

      else{
        state = true
        break
      }
      
    }
    if (state == false)
      break
  }

  return [signerAddress, address]

}