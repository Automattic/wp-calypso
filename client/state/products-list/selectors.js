import { property } from 'lodash';

export const getProductsList = property( 'items' );

export function isProductsListFetching( state ) {
	return state.productsList.isFetching;
}
