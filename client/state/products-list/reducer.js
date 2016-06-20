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
	PRODUCTS_LIST_REQUEST_SUCCESS,
	DESERIALIZE,
	SERIALIZE,
} from 'state/action-types';
import { productsListSchema } from './schema';
import { isValidStateWithSchema } from 'state/utils';

/**
 * Stores the complete list of products, indexed by the product key
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = null, action ) {
	switch ( action.type ) {
		case PRODUCTS_LIST_RECEIVE:
			return action.productsList;

		case SERIALIZE:
			return state;

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, productsListSchema ) ) {
				return state;
			}
			return {};
	}

	return state;
}

/**
 * Tracks sites fetching state
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isFetching( state = false, action ) {
	switch ( action.type ) {
		case PRODUCTS_LIST_REQUEST:
			return true;
		case PRODUCTS_LIST_REQUEST_FAILURE:
		case PRODUCTS_LIST_REQUEST_SUCCESS:
			return false;
		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}
	return state;
}

export default combineReducers( {
	isFetching,
	items,
} );
