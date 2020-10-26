/**
 * Internal dependencies
 */
import { getProductBySlug } from './get-product-by-slug';

import 'calypso/state/products-list/init';

/**
 * Returns the price of the specified product.
 *
 * @param {object} state - global state tree
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @returns {?number} the price formatted in the user's currency (e.g. '29.15'), or null otherwise
 */
export function getProductCost( state, productSlug ) {
	const product = getProductBySlug( state, productSlug );

	if ( ! product ) {
		return null;
	}

	return product.cost;
}
