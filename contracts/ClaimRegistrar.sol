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
	struct ClaimStorageReference {
		string storageName;
		string key;
	}

	/// @dev Maps address with the claimKeys.
	mapping(address => uint256[]) public allClaimKeys;

	/// @dev Maps claimKey<uint256: hash of address, propertyType, propertyId> with the claim.
	mapping(uint256 => Claim) public allClaims;

	/// @dev Maps address with the claim registry.
	mapping(address => ClaimStorageReference) public allClaimStorageReference;

	/// @inheritdoc IClaimRegistrar
	function claim(
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

	function listClaimKeys(address account)
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
		string memory propertyId
	) internal pure returns (uint256) {
		return
			uint256(keccak256(abi.encodePacked(account, propertyType, propertyId)));
	}
}
