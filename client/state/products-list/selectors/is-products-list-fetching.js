/**
 * Internal dependencies
 */
import 'state/products-list/init';

export function isProductsListFetching( state ) {
	return state.productsList.isFetching;
}
