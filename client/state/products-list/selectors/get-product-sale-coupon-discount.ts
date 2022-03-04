import { getProductBySlug } from './get-product-by-slug';
import type { AppState } from 'calypso/types';

import 'calypso/state/products-list/init';

/**
 * Returns the discount percentage of a sale coupon, or null if there is none.
 *
 * @param {object} state - global state tree
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @returns {number|null} - the discount percentage of a sale coupon, or null if there is none..
 */
export function getProductSaleCouponDiscount(
	state: AppState,
	productSlug: string
): number | null {
	const product = getProductBySlug( state, productSlug );

	if (
		! product ||
		product.sale_coupon === undefined ||
		product.sale_coupon.discount === undefined
	) {
		return null;
	}

	return product.sale_coupon.discount;
}
