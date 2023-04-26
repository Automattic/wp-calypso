import 'calypso/state/products-list/init';

/**
 * Are we currently fetching the products list?.
 *
 * @param {Object} state - Global state tree
 * @returns {boolean} - True if the product list is currently fetching, false otherwise.
 */
export function isProductsListFetching( state ) {
	return state.productsList.isFetching;
}
