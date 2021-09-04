// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

/// @title IClaimRegistrar - register ownership claims.
/// @author Shoya Yanagisawa - <shoya.yanagisawa@bridges.inc>
interface IClaimRegistrar {
	/// @dev Claim ownership of property with evidence.
	/// @param propertyType type of property
	/// @param propertyId ID of property
	/// @param evidence evidence
	/// @param method method of ownership verification method with evidence
	function claim(
		string memory propertyType,
		string memory propertyId,
		string memory evidence,
		string memory method
	) external;

	/// @dev Claim ownership of property with external storage.
	/// @param storageName name of storage
	/// @param key key of claime in the storage
	function claimWithExternal(string memory storageName, string memory key)
		external;

	/// @dev List keys of claim by an account
	/// @param account account of claimer
	/// @return [[claimKeys], storageName, key]
	function listClaimKeys(address account)
		external
		view
		returns (
			uint256[] memory,
			string memory,
			string memory
		);
}
