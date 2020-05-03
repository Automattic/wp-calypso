/**
 * External dependencies
 */

import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import {
	WOOCOMMERCE_CUSTOMERS_REQUEST,
	WOOCOMMERCE_CUSTOMERS_REQUEST_FAILURE,
	WOOCOMMERCE_CUSTOMERS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

/**
 * Returns the updated customer search state after an action has been
 * dispatched. The state reflects a mapping of search term to a
 * boolean reflecting whether a request for that term is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function isSearching( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_CUSTOMERS_REQUEST:
		case WOOCOMMERCE_CUSTOMERS_REQUEST_SUCCESS:
		case WOOCOMMERCE_CUSTOMERS_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.searchTerm ]: WOOCOMMERCE_CUSTOMERS_REQUEST === action.type,
			} );
		default:
			return state;
	}
}

/**
 * Tracks all known customer objects, indexed by post ID.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_CUSTOMERS_REQUEST_SUCCESS:
			const customers = keyBy( action.customers, 'id' );
			return Object.assign( {}, state, customers );
		default:
			return state;
	}
}

/**
 * Tracks the customers which belong to a query, as a list of IDs
 * referencing items in `customers.items`.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function queries( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_CUSTOMERS_REQUEST_SUCCESS:
			const idList = action.customers.map( ( item ) => item.id );
			return Object.assign( {}, state, { [ action.searchTerm ]: idList } );
		default:
			return state;
	}
}

export default combineReducers( {
	isSearching,
	items,
	queries,
} );
