import { getProductBySlug } from './get-product-by-slug';
import type { AppState } from 'calypso/types';

import 'calypso/state/products-list/init';

/**
 * Returns the currency code used in pricing for specified product.
 *
 * @param {Object} state - global state tree
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @returns {?string} the product currency code e.g. EUR
 */
export function getProductCurrencyCode( state: AppState, productSlug: string ) {
	const product = getProductBySlug( state, productSlug );

	if ( ! product ) {
		return null;
	}

	return product.currency_code;
}
