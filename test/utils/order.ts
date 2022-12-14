const EIP712 = require("./EIP712");

export function AssetType(assetClass:any, data:any) {
	return { assetClass, data }
}

export function Asset(assetClass:any, assetData:any, value:any) {
	return { assetType: AssetType(assetClass, assetData), value };
}

export function Order(maker:any, makeAsset:any, taker:any, takeAsset:any, salt:any, start:any, end:any, dataType:any, data:any) {
	return { maker, makeAsset, taker, takeAsset, salt, start, end, dataType, data };
}

export function DataV2(payouts:any, originFees:any, isMakeFill:any){
	return {payouts, originFees, isMakeFill}
}

export function Part(account:any, value:any){
	return {account, value}
}

const Types = {
	AssetType: [
		{name: 'assetClass', type: 'bytes4'},
		{name: 'data', type: 'bytes'}
	],
	Asset: [
		{name: 'assetType', type: 'AssetType'},
		{name: 'value', type: 'uint256'}
	],
	Order: [
		{name: 'maker', type: 'address'},
		{name: 'makeAsset', type: 'Asset'},
		{name: 'taker', type: 'address'},
		{name: 'takeAsset', type: 'Asset'},
		{name: 'salt', type: 'uint256'},
		{name: 'start', type: 'uint256'},
		{name: 'end', type: 'uint256'},
		{name: 'dataType', type: 'bytes4'},
		{name: 'data', type: 'bytes'},
	]
};

export async function sign(order:any, account:any, verifyingContract:any) {
	const chainId = Number(1);
	const data = EIP712.createTypeData({
		name: "Exchange",
		version: "2",
		chainId,
		verifyingContract
	}, 'Order', order, Types);
	return (await EIP712.testSign(account, data)).sig;
}

module.exports = { AssetType, Asset, Order, sign }