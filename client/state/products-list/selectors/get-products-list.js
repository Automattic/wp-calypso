/**
 * Internal dependencies
 */
import 'state/products-list/init';

export function getProductsList( state ) {
	return state.productsList.items;
}
