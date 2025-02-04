import { getProductBySlug } from './get-product-by-slug';

import 'calypso/state/products-list/init';

/**
 * Returns the display price of the specified product.
 * @param {Object} state - global state tree
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @param {?boolean} shouldDisplayMonthlyCost - whether the cost should be per month (defaults to false).
 * @returns {?string} the display price formatted in the user's currency (eg 'A$29.00'), or null otherwise
 */
export function getProductDisplayCost( state, productSlug, shouldDisplayMonthlyCost = false ) {
	const product = getProductBySlug( state, productSlug );

	if ( ! product ) {
		return null;
	}

	if ( shouldDisplayMonthlyCost ) {
		return product.cost_per_month_display;
	}

	return product.cost_display;
}
