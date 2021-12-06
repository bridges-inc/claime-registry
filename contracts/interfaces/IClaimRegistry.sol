// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

/// @title IClaimeRegistry store claims of ownership.
interface IClaimRegistry {
	/// @dev Claim of Ownership
	struct Claim {
		string propertyType;
		string propertyId;
		string method;
		string evidence;
	}

	/// @dev Reference to external
	struct ClaimRef {
		string ref;
		string key;
	}
	/// @dev Emit on a claim created/updated
	event ClaimUpdated(address claimer, Claim claim);

	/// @dev Emit on a claim removed
	event ClaimRemoved(address claimer, Claim claim);

	/// @dev Register a claim of ownership of property with evidence.
	/// @param propertyType type of property
	/// @param propertyId ID of property
	/// @param method method of ownership verification
	/// @param evidence evidence of ownership
	function register(
		string memory propertyType,
		string memory propertyId,
		string memory method,
		string memory evidence
	) external;

	/// @dev Remove a claim of ownership.
	/// @param propertyType type of property
	/// @param propertyId ID of property
	/// @param method method of ownership verification
	function remove(
		string memory propertyType,
		string memory propertyId,
		string memory method
	) external;

	/// @dev List keys of claims
	/// @param account account of claimer
	/// @return [[claimKeys]]
	function listClaims(address account) external view returns (uint256[] memory);
}
