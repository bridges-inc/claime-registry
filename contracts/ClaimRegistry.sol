// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "./interfaces/IClaimRegistry.sol";
import "hardhat/console.sol";

/// @title Claimer - manages the posted items and donation flows.
/// @author Shoya Yanagisawa - <shoya.yanagisawa@bridges.inc>
contract ClaimRegistry is IClaimRegistry {
	/// @dev Maps address with the claimKeys.
	mapping(address => uint256[]) public allClaimKeys;

	/// @dev Maps claimKey<uint256: hash of address, propertyType, propertyId, method> with the claim.
	mapping(uint256 => Claim) public allClaims;

	/// @inheritdoc IClaimRegistry
	function register(
		string memory propertyType,
		string memory propertyId,
		string memory method,
		string memory evidence
	) public override {
		require(!_isEmptyStr(propertyType), "CLM001");
		require(!_isEmptyStr(propertyId), "CLM002");
		uint256 claimKey = _toClaimKey(
			msg.sender,
			propertyType,
			propertyId,
			method
		);
		bool isNew = _isEmptyStr(allClaims[claimKey].propertyType);
		allClaims[claimKey].propertyType = propertyType;
		allClaims[claimKey].propertyId = propertyId;
		allClaims[claimKey].method = method;
		allClaims[claimKey].evidence = evidence;
		if (isNew) {
			allClaimKeys[msg.sender].push(claimKey);
		}
		emit ClaimUpdated(msg.sender, allClaims[claimKey]);
	}

	/// @inheritdoc IClaimRegistry
	function remove(
		string memory propertyType,
		string memory propertyId,
		string memory method
	) public override {
		require(!_isEmptyStr(propertyType), "CLM001");
		require(!_isEmptyStr(propertyId), "CLM002");
		uint256 claimKey = _toClaimKey(
			msg.sender,
			propertyType,
			propertyId,
			method
		);
		uint256 keysLength = allClaimKeys[msg.sender].length;
		uint256 index = keysLength;
		for (uint256 i = 0; i < keysLength; i++) {
			if (allClaimKeys[msg.sender][i] == claimKey) {
				index = i;
				break;
			}
		}
		if (index < keysLength) {
			Claim memory claim = allClaims[claimKey];
			delete allClaims[claimKey];
			allClaimKeys[msg.sender][index] = allClaimKeys[msg.sender][
				keysLength - 1
			];
			allClaimKeys[msg.sender].pop();
			emit ClaimRemoved(msg.sender, claim);
		}
	}

	/// @inheritdoc IClaimRegistry
	function listClaims(address account)
		public
		view
		override
		returns (uint256[] memory)
	{
		return allClaimKeys[account];
	}

	function _equalsStr(string memory a, string memory b)
		internal
		pure
		returns (bool)
	{
		if (bytes(a).length != bytes(b).length) {
			return false;
		} else {
			return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
		}
	}

	function _isEmptyStr(string memory a) internal pure returns (bool) {
		return _equalsStr(a, "");
	}

	function _toClaimKey(
		address account,
		string memory propertyType,
		string memory propertyId,
		string memory method
	) internal pure returns (uint256) {
		return
			uint256(
				keccak256(abi.encodePacked(account, propertyType, propertyId, method))
			);
	}
}
