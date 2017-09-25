/**
 * External dependencies
 */
import { pickBy } from 'lodash';

export function isProductsListFetching( state ) {
	return state.productsList.isFetching;
}

export function getProductsList( state ) {
	return state.productsList.items;
}

export function getAvailableProductsList( state ) {
	return pickBy( state.productsList.items, product => product.available );
}

/**
 * Returns the display price of a product
 *
 * @param {Object} state The Redux state tree
 * @param {string} productSlug The internal product slug, eg 'jetpack_premium'
 * @return {string} The display price formatted in the user's currency, eg "A$29.00"
 */
export function getProductDisplayCost( state, productSlug ) {
	const product = state.productsList.items[ productSlug ];
	if ( ! product ) {
		return null;
	}

	return product.cost_display;
}
