import { property } from 'lodash';

export const getProductsList = property( 'productsList.items' );

export function isProductsListFetching( state ) {
	return state.productsList.isFetching;
}
