import type { ProductsList, ProductsListFailure } from './types';

export const receiveProductsList = ( productsList: ProductsList ) => {
	return {
		type: 'PRODUCTS_LIST_RECEIVE' as const,
		productsList,
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
