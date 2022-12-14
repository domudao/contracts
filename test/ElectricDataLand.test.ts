import hre, { ethers, upgrades} from "hardhat";
import "@nomiclabs/hardhat-web3";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

import {DOMU, ElectricDataLand, DINToken, TestNFT, TokenProxy} from "../typechain"

import { ether } from "./utils";
import {getValidators, findFakeValidator} from './utils'
import "ethers";

describe("ElectricDataLand test", () => {
	let owner: SignerWithAddress;
    let john: SignerWithAddress;
	let bob: SignerWithAddress;
	let alice: SignerWithAddress;
	let tom: SignerWithAddress;
	let mike:SignerWithAddress;

	let domuToken : DOMU;
	let contract: ElectricDataLand;
	let tokenProxy: TokenProxy;
    let dinToken: DINToken;
	let testNFT: TestNFT;

	let addressList:any;
	let signerAddressList:any;


	
	const eth = "0x0000000000000000000000000000000000000000";

	before(async () => {
		const signers: SignerWithAddress[] = await hre.ethers.getSigners();

		owner = signers[0]
		alice= signers[1]
		bob = signers[2]
		john = signers[3]
		tom = signers[4]
		mike = signers[5]


        const domu = await ethers.getContractFactory("DOMU")
        domuToken = <DOMU>await domu.connect(owner).deploy()

		const TestNFT = await ethers.getContractFactory("TestNFT")
		testNFT = <TestNFT> await TestNFT.deploy()

		const tokenCreator = await ethers.getContractFactory("TokenProxy")
		tokenProxy = <TokenProxy> await tokenCreator.connect(owner).deploy()

        const nftContract = await ethers.getContractFactory("ElectricDataLand")
        contract = <ElectricDataLand>await upgrades.deployProxy(nftContract, [domuToken.address, testNFT.address, tokenProxy.address])

		addressList = [alice.address, bob.address, john.address, tom.address, mike.address]
		signerAddressList = [ alice, bob, john, tom, mike]

		console.log("addresses are: \n alice", alice.address, "\n bob", bob.address, "\n john", john.address, "\n tom", tom.address, "\n mike", mike.address)
	});

    describe("NFT contract initial testing", () => {
        it("Check if values of domu are correct", async()=>{
            expect(await domuToken.balanceOf(owner.address)).to.be.equal(ether(1000))
        })

		it("Mint some NFT tokens from test NFT",async ()=>{
			await testNFT.connect(owner).mint(2)
			expect(await testNFT.balanceOf(owner.address)).to.be.equal(2)
		})
    })

	describe("Staking testing",()=>{
		it("Try to stake without verifying", async()=>{
			await domuToken.connect(owner).transfer(alice.address, ether(2))
			await domuToken.connect(alice).approve(contract.address, ether(10))

			await expect(contract.connect(alice).stakeDomu(ether(1))).to.be.revertedWith("Not verified")
		})

		it("Verify user and try again", async()=>{
			await testNFT.connect(alice).mint(1)
			await contract.connect(alice).stakeDomu(ether(1))
			expect(await contract.stakedBalance(alice.address)).to.be.equal(ether(1))
			expect(await contract.validatorList(0)).to.be.equal(alice.address)
		})

		it("Unstake half", async()=>{
			await contract.connect(alice).unstakeDomu(ether("0.5"))
			expect(await contract.stakedBalance(alice.address)).to.be.equal(ether("0.5"))
			expect(await contract.validatorList(0)).to.be.equal(alice.address)
		})

		it("Unstake all, should be removed from list", async()=>{
			await contract.connect(alice).unstakeDomu(ether("0.5"))
			expect(await contract.stakedBalance(alice.address)).to.be.equal(0)
		})

		it("Stake with 4 validators", async()=>{
			await testNFT.connect(bob).mint(1)
			await testNFT.connect(john).mint(1)
			await testNFT.connect(tom).mint(1)
			await testNFT.connect(mike).mint(1)

			await domuToken.connect(owner).transfer(bob.address, ether(2))
			await domuToken.connect(owner).transfer(john.address, ether(5))
			await domuToken.connect(owner).transfer(tom.address, ether(20))
			await domuToken.connect(owner).transfer(mike.address, ether(3))

			await domuToken.connect(bob).approve(contract.address, ether(10))
			await domuToken.connect(john).approve(contract.address, ether(10))
			await domuToken.connect(tom).approve(contract.address, ether(20))
			await domuToken.connect(mike).approve(contract.address, ether(10))

			await contract.connect(alice).stakeDomu(ether(2))
			await contract.connect(bob).stakeDomu(ether(2))
			await contract.connect(john).stakeDomu(ether(5))
			await contract.connect(tom).stakeDomu(ether(4))
			await contract.connect(mike).stakeDomu(ether(3))


			expect(await contract.stakedBalance(alice.address)).to.be.equal(ether(2))
			expect(await contract.stakedBalance(bob.address)).to.be.equal(ether(2))
			expect(await contract.stakedBalance(john.address)).to.be.equal(ether(5))
			expect(await contract.stakedBalance(tom.address)).to.be.equal(ether(4))
			expect(await contract.stakedBalance(mike.address)).to.be.equal(ether(3))

			expect(await contract.validatorList(0)).to.be.equal(alice.address)
			expect(await contract.validatorList(1)).to.be.equal(bob.address)
			expect(await contract.validatorList(2)).to.be.equal(john.address)
			expect(await contract.validatorList(3)).to.be.equal(tom.address)
			expect(await contract.validatorList(4)).to.be.equal(mike.address)

		})
	})

	describe("Proposal publishing",()=>{
		it("Publish proposal", async()=>{
			let hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(("michaelgeorgeanniesmith")))

			await domuToken.connect(owner).approve(contract.address, ether(1000))
			await contract.connect(owner).submitProposal("ipfs://String",hash)

			let val = await contract.returnValidators(0)
			console.log("so far so good")

			const [signerWallets, validators] = getValidators(val,addressList, signerAddressList)
			console.log("validators are: ", validators)

			expect((await contract.validatorQueue(validators[0],0))).to.be.equal(0)
			expect((await contract.validatorQueue(validators[1],0))).to.be.equal(0)
			expect((await contract.validatorQueue(validators[2],0))).to.be.equal(0)
			expect((await contract.propertyOwner(owner.address, 0))).to.be.equal(0) 


			//expect((await domuToken.balanceOf(owner.address))).to.be.equal(ether(1))

		})

		it("Validator votes, fake validator", async()=>{
			let hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(("michaelgeorgeanniesmith")))
			let val = await contract.returnValidators(0)

			const [signerFake, fakeAddress] = findFakeValidator(val, addressList, signerAddressList)
			console.log("Fake validator attempting to vote:", fakeAddress)
			await expect(contract.connect(signerFake).validatorDecision(0,hash, true)).to.be.revertedWith("Not a validator")
		})

		it("Validator votes, true validator", async()=>{
			let hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(("michaelgeorgeanniesmith")))
			let val = await contract.returnValidators(0)
			const [signerWallets, validators] = getValidators(val,addressList, signerAddressList)
			await contract.connect(signerWallets[0]).validatorDecision(0,hash, true)

			expect((await contract.proposalList(0)).numVotes).to.be.equal(1)
			expect((await contract.validatorVotes(0,validators[0])).voted).to.be.equal(true)
			expect((await contract.validatorVotes(0,validators[0])).hash).to.be.equal(hash)
		})

		it("Try to vote again, change vote", async()=>{
			let hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(("michaelgeorgeanniesmith12")))
			let val = await contract.returnValidators(0)
			const [signerWallets, validators] = getValidators(val,addressList, signerAddressList)

			await expect(contract.connect(signerWallets[0]).validatorDecision(0,hash, false)).to.be.revertedWith("Already voted")
			
		})

		it("2 other validators, true validators", async()=>{
			let hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(("michaelgeorgeanniesmith")))

			let val = await contract.returnValidators(0)
			const [signerWallets, validators] = getValidators(val,addressList, signerAddressList)
			console.log("validators are: ", validators)
			await contract.connect(signerWallets[1]).validatorDecision(0,hash, true)

			let balance1 = await domuToken.balanceOf(validators[0])
			let balance2 = await domuToken.balanceOf(validators[1])
			let balance3 = await domuToken.balanceOf(validators[2])
			let contractBalance = await domuToken.balanceOf(contract.address)

			await contract.connect(signerWallets[2]).validatorDecision(0,hash, true)

			let diff1 = (await domuToken.balanceOf(validators[0])).sub(balance1)
			let diff2 = (await domuToken.balanceOf(validators[1])).sub(balance2)
			let diff3 = (await domuToken.balanceOf(validators[2])).sub(balance3)
			let contractDiff = contractBalance.sub(await domuToken.balanceOf(contract.address))

			expect(diff1).to.be.equal(ether(0.25))
			expect(diff2).to.be.equal(ether(0.25))
			expect(diff3).to.be.equal(ether(0.25))
			expect(await domuToken.balanceOf(domuToken.address)).to.be.equal(ether(0.25))
			expect(contractDiff).to.be.equal(ether(1))

			expect(await contract.balanceOf(owner.address)).to.be.equal(1)
			expect(await contract.ownerOf(0)).to.be.equal(owner.address)

			//Accepted proposal
			expect((await contract.proposalList(0)).status).to.be.equal(1)
		})

		it("New proposal , 2 true, 1 false validator",async()=>{

			let hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(("johnstockton")))
			await contract.connect(owner).submitProposal("ipfs://String4545",hash)
			//john, mike, tom
			let hash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(("michaelgeorgeanniesmith")))

			let val = await contract.returnValidators(1)
			const [signerWallets, validators] = getValidators(val,addressList, signerAddressList)
			console.log("validators are: ", validators)

			let val0Stake = await contract.stakedBalance(validators[0])
			let val1Stake = await contract.stakedBalance(validators[1])

			let balance1 = await domuToken.balanceOf(validators[0])
			let balance2 = await domuToken.balanceOf(validators[1])
			let balance3 = await domuToken.balanceOf(validators[2])

			await contract.connect(signerWallets[0]).validatorDecision(1,hash, true)
			await contract.connect(signerWallets[1]).validatorDecision(1,hash, true)
			await contract.connect(signerWallets[2]).validatorDecision(1,hash1, true)

			expect(await contract.balanceOf(owner.address)).to.be.equal(2)
			expect(await contract.ownerOf(1)).to.be.equal(owner.address)
			expect((await contract.proposalList(1)).status).to.be.equal(1)

			//should lose its stake for fault
			expect(await contract.stakedBalance(validators[2])).to.be.equal(0)

			let stake0Dif = (await contract.stakedBalance(validators[0])).sub(val0Stake)
			let stake1Dif = (await contract.stakedBalance(validators[1])).sub(val1Stake)

			expect(stake0Dif).to.be.equal(0)
			expect(stake1Dif).to.be.equal(0)

			let diff1 = (await domuToken.balanceOf(validators[0])).sub(balance1)
			let diff2 = (await domuToken.balanceOf(validators[1])).sub(balance2)
			let diff3 = (await domuToken.balanceOf(validators[2])).sub(balance3)

			expect(diff1).to.be.equal("333333333333333333")
			expect(diff2).to.be.equal("333333333333333333")

			//should lose stake
			expect(diff3).to.be.equal(ether(0))

			expect((await contract.proposalList(0)).status).to.be.equal(1)

		})

		it("New proposal , 3 false validators",async()=>{

			let hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(("luiebronson")))
			await contract.connect(owner).submitProposal("ipfs://some2",hash)

			let hash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(("mikejack11")))


			let val = await contract.returnValidators(2)
			const [signerWallets, validators] = getValidators(val,addressList, signerAddressList)
			console.log("validators are: ", validators)

			let val0Stake = await contract.stakedBalance(validators[0])
			let val1Stake = await contract.stakedBalance(validators[1])
			let val2Stake = await contract.stakedBalance(validators[2])

			let balance1 = await domuToken.balanceOf(validators[0])
			let balance2 = await domuToken.balanceOf(validators[1])
			let balance3 = await domuToken.balanceOf(validators[2])

			await contract.connect(signerWallets[0]).validatorDecision(2,hash1, true)
			await contract.connect(signerWallets[1]).validatorDecision(2,hash1, true)
			await contract.connect(signerWallets[2]).validatorDecision(2,hash1, true)

			let stake0Dif = (await contract.stakedBalance(validators[0])).sub(val0Stake)
			let stake1Dif = (await contract.stakedBalance(validators[1])).sub(val1Stake)
			let stake2Dif = (await contract.stakedBalance(validators[2])).sub(val2Stake)

			expect(stake0Dif).to.be.equal(0)
			expect(stake1Dif).to.be.equal(0)
			expect(stake2Dif).to.be.equal(0)

			expect(await contract.balanceOf(owner.address)).to.be.equal(2)

			let balance11 = await domuToken.balanceOf(validators[0])
			let balance22 = await domuToken.balanceOf(validators[1])
			let balance33 = await domuToken.balanceOf(validators[2])

			let dif1 = balance11.sub(balance1)
			let dif2 = balance22.sub(balance2)
			let dif3 = balance33.sub(balance3)

			expect(dif1).to.be.equal(ether(0.25))
			expect(dif2).to.be.equal(ether(0.25))
			expect(dif3).to.be.equal(ether(0.25))

			expect((await contract.proposalList(2)).status).to.be.equal(2)
		})

		it("Validator comes to stake, one validator is unsure, after that 1 is true 2 false validator",async()=>{

			await contract.connect(tom).stakeDomu(ether(10))
			let hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(("marcussmith")))
			await contract.connect(owner).submitProposal("ipfs://superString1786974",hash)

			let val = await contract.returnValidators(3)
			const [signerWallets, validators] = getValidators(val,addressList, signerAddressList)
			console.log("validators are: ", validators)

			let hash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(("jacobdaniels")))
			let val0Stake = await contract.stakedBalance(validators[0])
			let val1Stake = await contract.stakedBalance(validators[1])
			let val2Stake = await contract.stakedBalance(validators[2])

			let balance1 = await domuToken.balanceOf(validators[0])
			let balance2 = await domuToken.balanceOf(validators[1])
			let balance3 = await domuToken.balanceOf(validators[2])

			//should lose stake
 			await contract.connect(signerWallets[0]).validatorDecision(3,hash, true)
			await contract.connect(signerWallets[1]).validatorDecision(3,hash, false)

			//get new validator
			val = await contract.returnValidators(3)
			const [signerWalletsNew, validatorsNew] = getValidators(val,addressList, signerAddressList)
			let balance4 = await domuToken.balanceOf(validatorsNew[1])
			let val3Stake = await contract.stakedBalance(validatorsNew[1])
			console.log("New validator list is: ", validatorsNew)

			await contract.connect(signerWalletsNew[1]).validatorDecision(3,hash1, true)
			await contract.connect(signerWallets[2]).validatorDecision(3,hash1, true)

			expect((await contract.proposalList(2)).status).to.be.equal(2)
			expect(await contract.balanceOf(owner.address)).to.be.equal(2)


			let balance11 = await domuToken.balanceOf(validators[0])
			let balance22 = await domuToken.balanceOf(validators[1])
			let balance33 = await domuToken.balanceOf(validators[2])
			let balance44 = await domuToken.balanceOf(validatorsNew[1])

			let dif1 = balance11.sub(balance1)
			let dif2 = balance22.sub(balance2)
			let dif3 = balance33.sub(balance3)
			let dif4 = balance44.sub(balance4)


			let stake0Dif = (val0Stake).sub(await contract.stakedBalance(validators[0]))
			let stake1Dif = (await contract.stakedBalance(validators[1])).sub(val1Stake)
			let stake2Dif = (await contract.stakedBalance(validators[2])).sub(val2Stake)
			let stake3Dif = (await contract.stakedBalance(validatorsNew[1])).sub(val3Stake)

			expect(stake0Dif).to.be.equal(val0Stake)
			expect(stake1Dif).to.be.equal(0)
			expect(stake2Dif).to.be.equal(0)
			expect(stake3Dif).to.be.equal(0)

			expect(dif1).to.be.equal(ether(0))
			expect(dif2).to.be.equal(0)
			expect(dif3).to.be.equal("333333333333333333")
			expect(dif4).to.be.equal("333333333333333333")
		})

		//test minting tokens with depositing NFT

		it("Deposit NFT owner",async()=>{

			await contract.connect(owner).depositNFT(1)

			let address = await contract.contractList(1)

			let token = await domuToken.attach(
                address
            )

			expect(await token.totalSupply()).to.be.equal(ether(100))
			expect( await token.balanceOf(owner.address)).to.be.equal(ether(100))
			expect(await contract.ownerOf(1)).to.be.equal(contract.address)

		})


		//test burning NFT
		it("Return NFT", async()=>{
			///wants to return id 1

			let address= await contract.contractList(1)
			let token = await domuToken.attach(
                address
            )

			expect(await contract.ownerOf(1)).to.be.equal(contract.address)
			await token.connect(owner).approve(contract.address,ether(1000))
			await contract.connect(owner).withdrawNFT(1)

			expect(await token.balanceOf(contract.address)).to.be.equal(ether(100))
			expect(await token.balanceOf(owner.address)).to.be.equal(0)
			expect(await contract.ownerOf(1)).to.be.equal(owner.address)

		})

		it("Deposit NFT again",async()=>{
			await contract.connect(owner).depositNFT(1)

			let address = await contract.contractList(1)

			let token = await domuToken.attach(
                address
            )

			expect(await token.totalSupply()).to.be.equal(ether(100))
			expect( await token.balanceOf(owner.address)).to.be.equal(ether(100))
			expect(await contract.ownerOf(1)).to.be.equal(contract.address)
		})

		it("Return NFT again", async()=>{
			///wants to return id 1
			let address= await contract.contractList(1)
			let token = await domuToken.attach(
                address
            )

			expect(await contract.ownerOf(1)).to.be.equal(contract.address)
			await token.connect(owner).approve(contract.address,ether(1000))
			await contract.connect(owner).withdrawNFT(1)

			expect(await token.balanceOf(contract.address)).to.be.equal(ether(100))
			expect(await token.balanceOf(owner.address)).to.be.equal(0)
			expect(await contract.ownerOf(1)).to.be.equal(owner.address)

		})

		it("Burn NFT", async()=>{
			let balancePrevious = await domuToken.balanceOf(owner.address)

			await contract.connect(owner).burnNFT(1);
			let balanceNow = await domuToken.balanceOf(owner.address)
			let sub = balancePrevious.sub(balanceNow)

			expect(sub).to.be.equal(ether(100))
		})
	})
})
