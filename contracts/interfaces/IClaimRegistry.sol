// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

/// @title IClaimRegistry - register ownership claims.
/// @author Shoya Yanagisawa - <shoya.yanagisawa@bridges.inc>
interface IClaimRegistry {
	/// @dev Claim of Ownership
	struct Claim {
		string propertyType;
		string propertyId;
		string evidence;
		string method;
	}

	/// @dev Reference to external
	struct ClaimRef {
		string ref;
		string key;
	}
	/// @dev Emit on a claim created/updated
	event ClaimUpdated(address claimer, Claim claim);

	/// @dev Emit on a claim removed
	event ClaimRemoved(address claimer, string propertyType, string propertyId);

	/// @dev Emit on a claim ref created/updated
	event ClaimRefUpdated(address claimer, ClaimRef ref);

	/// @dev Emit on a claim ref removed
	event ClaimRefRemoved(address claimer);

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
	/// @param ref type of reference
	/// @param key key of a claim in the reference
	function registerRef(string memory ref, string memory key) external;

	/// @dev Remove a claim of ownership.
	/// @param propertyType type of property
	/// @param propertyId ID of property
	function remove(string memory propertyType, string memory propertyId)
		external;

	/// @dev Remove a reference of claims of ownership of property.
	function removeRef() external;

	/// @dev List keys of claim and a reference by an account
	/// @param account account of claimer
	/// @return [[claimKeys], [ref, key]]
	function listClaims(address account)
		external
		view
		returns (uint256[] memory, string[2] memory);
}
