import type { ProductsList, ProductsListFailure, ProductsListResponse } from './types';

export const receiveProductsList = (
	productsList: ProductsList,
	type: string | null = null
): ProductsListResponse => {
	return {
		type: 'PRODUCTS_LIST_RECEIVE' as const,
		productsList,
		productsListType: type,
	};
};

export const requestProductsList = () => ( {
	type: 'PRODUCTS_LIST_REQUEST' as const,
} );

export const receiveProductsListFailure = ( error: ProductsListFailure ) => ( {
	type: 'PRODUCTS_LIST_REQUEST_FAILURE' as const,
	error,
} );

export type Action =
	| ReturnType<
			typeof receiveProductsList | typeof requestProductsList | typeof receiveProductsListFailure
	  >
	| { type: 'TEST_ACTION' };
