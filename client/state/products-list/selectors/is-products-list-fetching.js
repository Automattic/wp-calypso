/**
 * Internal dependencies
 */
import 'calypso/state/products-list/init';

export function isProductsListFetching( state ) {
	return state.productsList.isFetching;
}
