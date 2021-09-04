// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

/// @title IClaimRegistrar - register ownership claims.
/// @author Shoya Yanagisawa - <shoya.yanagisawa@bridges.inc>
interface IClaimRegistrar {
	/// @dev Register a claim of ownership of property with evidence.
	/// @param propertyType type of property
	/// @param propertyId ID of property
	/// @param evidence evidence of ownership
	/// @param method method of ownership verification
	function register(
		string memory propertyType,
		string memory propertyId,
		string memory evidence,
		string memory method
	) external;

	/// @dev Register a reference of claims of ownership of property.
	/// @param storageName name of a storage
	/// @param key key of a claim in the storage
	function registerReference(string memory storageName, string memory key)
		external;

	/// @dev Remove a claim of ownership.
	/// @param propertyType type of property
	/// @param propertyId ID of property
	function remove(string memory propertyType, string memory propertyId)
		external;

	/// @dev Remove a reference of claims of ownership of property.
	function removeReference() external;

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
