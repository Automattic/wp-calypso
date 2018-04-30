/** @format */

/**
 * Internal dependencies
 */

import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';
import { productsListSchema } from './schema';

// Stores the complete list of products, indexed by the product key
export const items = createReducer(
	{},
	{
		[ PRODUCTS_LIST_RECEIVE ]: ( state, action ) => action.productsList,
	},
	productsListSchema
);

// Has the products list been loaded from server yet? As opposed to using the potentially
// stale data from local storage.
export const hasLoadedFromServer = ( state = false, action ) => {
	switch ( action.type ) {
		case PRODUCTS_LIST_RECEIVE:
			return true;
	}
	return state;
};

// Tracks product list fetching state
export const isFetching = ( state = false, action ) => {
	switch ( action.type ) {
		case PRODUCTS_LIST_REQUEST:
			return true;
		case PRODUCTS_LIST_RECEIVE:
		case PRODUCTS_LIST_REQUEST_FAILURE:
			return false;
	}
	return state;
};

export default combineReducers( {
	hasLoadedFromServer,
	isFetching,
	items,
} );
