import { getProductBySlug } from './get-product-by-slug';
import type { AppState } from 'calypso/types';

import 'calypso/state/products-list/init';

/**
 * Returns the description of the specified product.
 *
 * @param {Object} state - global state tree
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @returns {?string} the product description
 */
export function getProductDescription( state: AppState, productSlug: string ) {
	const product = getProductBySlug( state, productSlug );

	if ( ! product ) {
		return null;
	}

	return product.description;
}
