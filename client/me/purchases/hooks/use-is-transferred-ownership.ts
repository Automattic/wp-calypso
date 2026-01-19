import type { Purchases } from '@automattic/data-stores';

/**
 * Utility function to determine if a purchase has transferred ownership.
 * Uses a Set for O(1) lookup performance instead of array.some() O(n) search.
 * This function can be used in class components where hooks are not available.
 * @param purchaseId - The ID of the purchase to check
 * @param transferredOwnershipPurchases - Array of purchases with transferred ownership
 * @returns boolean indicating if the purchase has transferred ownership
 */
export function isTransferredOwnership(
	purchaseId: number,
	transferredOwnershipPurchases: Purchases.Purchase[] = []
): boolean {
	const transferredOwnershipIds = new Set(
		transferredOwnershipPurchases.map( ( transferredPurchase ) => transferredPurchase.id )
	);
	return transferredOwnershipIds.has( purchaseId );
}
