import { ethers } from "ethers";
import { web3 } from "hardhat";

const ethUtil = require('ethereumjs-util');

export function id(str:any) {
	console.log(str, `0x${ethUtil.keccak256(str).toString("hex").substring(0, 8)}`)
	return `0x${ethUtil.keccak256(str).toString("hex").substring(0, 8)}`;
}

export function enc(token:any, tokenId:any) {
	let abiCode = new ethers.utils.AbiCoder()
	if (tokenId) {
		return abiCode.encode(["address", "uint256"], [token, tokenId]);
	} else {
		return abiCode.encode(["address"], [token]);
	}
}

export const ETH = id("ETH");
export const ERC20 = id("ERC20");
export const ERC721 = id("ERC721");
export const ERC721_LAZY = id("ERC721_LAZY");
export const ERC1155 = id("ERC1155");
export const ERC1155_LAZY = id("ERC1155_LAZY");
export const COLLECTION = id("COLLECTION");
export const CRYPTO_PUNKS = id("CRYPTO_PUNKS");
export const ORDER_DATA_V1 = id("V1");
export const ORDER_DATA_V2 = id("V2");
export const TO_MAKER = id("TO_MAKER");
export const TO_TAKER = id("TO_TAKER");
export const PROTOCOL = id("PROTOCOL");
export const ROYALTY = id("ROYALTY");
export const ORIGIN = id("ORIGIN");
export const PAYOUT = id("PAYOUT");

module.exports = { id, ETH, ERC20, ERC721, ERC721_LAZY, ERC1155, ERC1155_LAZY, ORDER_DATA_V1, ORDER_DATA_V2, TO_MAKER, TO_TAKER, PROTOCOL, ROYALTY, ORIGIN, PAYOUT, CRYPTO_PUNKS, COLLECTION, enc }