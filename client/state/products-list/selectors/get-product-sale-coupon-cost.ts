import { getProductBySlug } from './get-product-by-slug';
import type { AppState } from 'calypso/types';

import 'calypso/state/products-list/init';

/**
 * Returns the product cost with a sale coupon, or null if there is no sale coupon.
 *
 * @param {Object} state - global state tree
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @returns {number|null} - the product cost with a sale coupon, or null if there is no sale coupon.
 */
export function getProductSaleCouponCost( state: AppState, productSlug: string ): number | null {
	const product = getProductBySlug( state, productSlug );

	if ( ! product || product.sale_cost === undefined ) {
		return null;
	}

	return product.sale_cost;
}
