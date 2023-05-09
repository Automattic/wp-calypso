import { getProductBySlug } from './get-product-by-slug';
import type { PriceTierEntry } from '@automattic/calypso-products';
import type { AppState } from 'calypso/types';
import 'calypso/state/products-list/init';

/**
 * Returns the price tiers of the specified product.
 *
 * @param {Object} state - global state tree
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @returns {PriceTierEntry[]} The price tiers.
 */
export function getProductPriceTierList( state: AppState, productSlug: string ): PriceTierEntry[] {
	const product = getProductBySlug( state, productSlug );

	if ( ! product || ! product.price_tier_list ) {
		return [];
	}

	return product.price_tier_list;
}
