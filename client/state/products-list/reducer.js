/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'state/action-types';
import { productsListSchema } from './schema';
import { createReducer } from 'state/utils';

// Stores the complete list of products, indexed by the product key
export const items = createReducer( {}, {
	[ PRODUCTS_LIST_RECEIVE ]: ( state, action ) => action.productsList,
}, productsListSchema );

// Tracks product list fetching state
export const isFetching = createReducer( false, {
	[ PRODUCTS_LIST_REQUEST ]: () => true,
	[ PRODUCTS_LIST_RECEIVE ]: () => false,
	[ PRODUCTS_LIST_REQUEST_FAILURE ]: () => false
} );

export default combineReducers( {
	isFetching,
	items,
} );
