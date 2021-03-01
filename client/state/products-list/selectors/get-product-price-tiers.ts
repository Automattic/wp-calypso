/**
 * Internal dependencies
 */
import { getProductBySlug } from './get-product-by-slug';

import 'calypso/state/products-list/init';
import type { AppState } from 'calypso/types';

type Product = {
	price_tiers: PriceTiers;
};

export type PriceTiers = Record< string, PriceTier >;

export type PriceTier =
	| {
			flat_price: number;
	  }
	| {
			variable_price_per_unit: number;
			unit: number;
	  };

/**
 * Returns the price tiers of the specified product.
 *
 * @param {object} state - global state tree
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @returns {PriceTiers|null} The price tiers or null. See PriceTiers for format.
 */
export function getProductPriceTiers( state: AppState, productSlug?: string ): PriceTiers | null {
	if ( ! productSlug ) {
		return null;
	}
	const product = getProductBySlug( state, productSlug ) as Product;

	if ( ! product || ! product.price_tiers || ! Object.keys( product.price_tiers ).length ) {
		return null;
	}

	return product.price_tiers;
}

export default getProductPriceTiers;
