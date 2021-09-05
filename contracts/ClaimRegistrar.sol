// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "./interfaces/IClaimRegistrar.sol";
import "hardhat/console.sol";

/// @title Claimer - manages the posted items and donation flows.
/// @author Shoya Yanagisawa - <shoya.yanagisawa@bridges.inc>
contract ClaimRegistrar is IClaimRegistrar {
	/** Structs */

	/// @dev Claim of Ownership
	struct Claim {
		string propertyType;
		string propertyId;
		string evidence;
		string method;
	}

	/// @dev Reference of external storage
	struct ClaimRef {
		string ref;
		string key;
	}

	/// @dev Maps address with the claimKeys.
	mapping(address => uint256[]) public allClaimKeys;

	/// @dev Maps claimKey<uint256: hash of address, propertyType, propertyId> with the claim.
	mapping(uint256 => Claim) public allClaims;

	/// @dev Maps address with the claim registry.
	mapping(address => ClaimRef) public allClaimRefs;

	/// @inheritdoc IClaimRegistrar
	function register(
		string memory propertyType,
		string memory propertyId,
		string memory evidence,
		string memory method
	) public override {
		require(!_isEmptyStr(propertyType), "CLM001");
		require(!_isEmptyStr(propertyId), "CLM002");
		uint256 claimKey = _toClaimKey(msg.sender, propertyType, propertyId);
		bool isNew = _isEmptyStr(allClaims[claimKey].propertyType);
		allClaims[claimKey].propertyType = propertyType;
		allClaims[claimKey].propertyId = propertyId;
		allClaims[claimKey].evidence = evidence;
		allClaims[claimKey].method = method;
		if (isNew) {
			allClaimKeys[msg.sender].push(claimKey);
		}
	}

	/// @inheritdoc IClaimRegistrar
	function registerRef(string memory ref, string memory key) public override {
		allClaimRefs[msg.sender].ref = ref;
		allClaimRefs[msg.sender].key = key;
	}

	/// @inheritdoc IClaimRegistrar
	function remove(string memory propertyType, string memory propertyId)
		public
		override
	{
		require(!_isEmptyStr(propertyType), "CLM001");
		require(!_isEmptyStr(propertyId), "CLM002");
		uint256 claimKey = _toClaimKey(msg.sender, propertyType, propertyId);
		uint256 keysLength = allClaimKeys[msg.sender].length;
		uint256 index = keysLength;
		for (uint256 i = 0; i < keysLength - 1; i++) {
			if (allClaimKeys[msg.sender][i] == claimKey) {
				index = i;
				break;
			}
		}
		if (index < keysLength) {
			delete allClaims[claimKey];
			allClaimKeys[msg.sender][index] = allClaimKeys[msg.sender][
				keysLength - 1
			];
			allClaimKeys[msg.sender].pop();
		}
	}

	/// @inheritdoc IClaimRegistrar
	function removeRef() public override {
		registerRef("", "");
	}

	/// @inheritdoc IClaimRegistrar
	function listClaims(address account)
		public
		view
		override
		returns (uint256[] memory, string[2] memory)
	{
		return (
			allClaimKeys[account],
			[allClaimRefs[account].ref, allClaimRefs[account].key]
		);
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
		string memory propertyId
	) internal pure returns (uint256) {
		return
			uint256(keccak256(abi.encodePacked(account, propertyType, propertyId)));
	}
}
