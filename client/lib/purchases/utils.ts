/**
 * Internal dependencies
 */

/**
 * Type dependencies
 */
import type { Purchase } from './types';

/**
 * Finds a purchase by the slug of its associated product.
 *
 * @param {Purchase[]} purchases List of purchases to search in
 * @param {string} slug Product slug
 * @returns {Purchase} Found purchase, if any
 */
export function getPurchaseByProductSlug(
	purchases: Purchase[],
	slug: string
): Purchase | undefined {
	return purchases.find( ( purchase ) => purchase.productSlug === slug );
}
