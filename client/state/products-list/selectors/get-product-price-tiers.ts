/**
 * Internal dependencies
 */
import { getProductBySlug } from './get-product-by-slug';

import 'calypso/state/products-list/init';
import type { AppState } from 'calypso/types';

type Product = {
	price_tier_list: PriceTierEntry[];
};

export interface PriceTierEntry {
	minimum_units: number;
	maximum_units?: undefined | null | number;
	minimum_price_display: string;
	minimum_price_monthly_display: string;
	maximum_price_display?: string | null | undefined;
	maximum_price_monthly_display?: string | null | undefined;
}

/**
 * Returns the price tiers of the specified product.
 *
 * @param {object} state - global state tree
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @returns {PriceTierEntry[]} The price tiers.
 */
export function getProductPriceTierList( state: AppState, productSlug: string ): PriceTierEntry[] {
	const product = getProductBySlug( state, productSlug ) as Product;

	if ( ! product || ! product.price_tier_list ) {
		return [];
	}

	return product.price_tier_list;
}
