import { select } from '@wordpress/data';
import { STORE_KEY } from './constants';
import type { State } from './reducer';

export const getState = ( state: State ) => state;

export const getProductsList = ( state: State ) => {
	return state.productsList;
};

export const getProductBySlug = ( _state: State, slug: string ) => {
	if ( ! slug ) {
		return undefined;
	}
	const products = select( STORE_KEY ).getProductsList();

	if ( ! products ) {
		return undefined;
	}

	return products?.[ slug ];
};
