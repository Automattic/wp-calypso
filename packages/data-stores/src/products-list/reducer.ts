import { combineReducers } from '@wordpress/data';
import { RawAPIProductsList } from './types';
import type { Action } from './actions';
import type { Reducer } from 'redux';

// Stores the complete list of products, indexed by the product key
export const productsList: Reducer< RawAPIProductsList | undefined, Action > = (
	state,
	action
) => {
	switch ( action.type ) {
		case 'PRODUCTS_LIST_RECEIVE':
			return action.productsList;
	}

	return state;
};

// Tracks product list fetching state
export const isFetchingProductsList: Reducer< boolean | undefined, Action > = (
	state = false,
	action
) => {
	switch ( action.type ) {
		case 'PRODUCTS_LIST_REQUEST':
			return true;
		case 'PRODUCTS_LIST_RECEIVE':
			return false;
		case 'PRODUCTS_LIST_REQUEST_FAILURE':
			return false;
	}

	return state;
};

const reducer = combineReducers( {
	isFetchingProductsList,
	productsList,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
