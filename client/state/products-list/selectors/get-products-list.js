/**
 * Internal dependencies
 */
import 'calypso/state/products-list/init';

export function getProductsList( state ) {
	return state.productsList.items;
}
