import { getProductBySlug } from './get-product-by-slug';

import 'calypso/state/products-list/init';

/**
 * Returns the name of the specified product.
 *
 * @param {Object} state - global state tree
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @returns {?string} the product name
 */
export function getProductName( state, productSlug ) {
	const product = getProductBySlug( state, productSlug );

	if ( ! product ) {
		return null;
	}

	return product.product_name;
}
