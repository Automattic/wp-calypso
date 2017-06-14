/**
 * External dependencies
 */
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import {
	WOOCOMMERCE_ORDERS_REQUEST,
	WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
	WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

/**
 * Returns the updated order requests state after an action has been
 * dispatched. The state reflects a mapping of page number to a
 * boolean reflecting whether a request for that page is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isLoading( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDERS_REQUEST:
		case WOOCOMMERCE_ORDERS_REQUEST_SUCCESS:
		case WOOCOMMERCE_ORDERS_REQUEST_FAILURE:
			return Object.assign( {}, state, { [ action.page ]: WOOCOMMERCE_ORDERS_REQUEST === action.type } );
		default:
			return state;
	}
}

/**
 * Tracks all known order objects, indexed by post ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDERS_REQUEST_SUCCESS:
			const orders = keyBy( action.orders, 'id' );
			return Object.assign( {}, state, orders );
		default:
			return state;
	}
}

/**
 * Tracks the orders which belong on a page, as a list of IDs
 * referencing items in `orders.items`.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function pages( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDERS_REQUEST_SUCCESS:
			const idList = action.orders.map( order => order.id );
			return Object.assign( {}, state, { [ action.page ]: idList } );
		default:
			return state;
	}
}

/**
 * Tracks the total number of pages of orders for the current site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function totalPages( state = 1, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDERS_REQUEST_SUCCESS:
			return action.totalPages;
		default:
			return state;
	}
}

export default combineReducers( {
	isLoading,
	items,
	pages,
	totalPages,
} );
