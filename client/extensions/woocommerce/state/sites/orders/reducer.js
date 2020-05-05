/**
 * External dependencies
 */

import { isFinite, keyBy, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { getSerializedOrdersQuery } from './utils';
import invoice from './send-invoice/reducer';
import notes from './notes/reducer';
import {
	WOOCOMMERCE_ORDER_DELETE,
	WOOCOMMERCE_ORDER_DELETE_FAILURE,
	WOOCOMMERCE_ORDER_DELETE_SUCCESS,
	WOOCOMMERCE_ORDER_REQUEST,
	WOOCOMMERCE_ORDER_REQUEST_FAILURE,
	WOOCOMMERCE_ORDER_REQUEST_SUCCESS,
	WOOCOMMERCE_ORDER_UPDATE,
	WOOCOMMERCE_ORDER_UPDATE_SUCCESS,
	WOOCOMMERCE_ORDER_UPDATE_FAILURE,
	WOOCOMMERCE_ORDERS_REQUEST,
	WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
	WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import refunds from './refunds/reducer';

/**
 * Returns the updated order requests state after an action has been
 * dispatched. The state reflects a mapping of order ID to a
 * boolean reflecting whether a request for that page is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function isDeleting( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDER_DELETE:
		case WOOCOMMERCE_ORDER_DELETE_FAILURE:
		case WOOCOMMERCE_ORDER_DELETE_SUCCESS:
			return Object.assign( {}, state, {
				[ action.orderId ]: WOOCOMMERCE_ORDER_DELETE === action.type,
			} );
		default:
			return state;
	}
}

/**
 * Returns the updated order requests state after an action has been
 * dispatched. The state reflects a mapping of order ID to a
 * boolean reflecting whether a request for that page is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function isLoading( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDER_REQUEST:
		case WOOCOMMERCE_ORDER_REQUEST_SUCCESS:
		case WOOCOMMERCE_ORDER_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.orderId ]: WOOCOMMERCE_ORDER_REQUEST === action.type,
			} );
		default:
			return state;
	}
}

/**
 * Returns the updated order requests state after an action has been
 * dispatched. The state reflects a mapping of query (page number) to a
 * boolean reflecting whether a request for that page is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function isQueryLoading( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDERS_REQUEST:
		case WOOCOMMERCE_ORDERS_REQUEST_SUCCESS:
		case WOOCOMMERCE_ORDERS_REQUEST_FAILURE:
			const query = getSerializedOrdersQuery( action.query );
			return Object.assign( {}, state, { [ query ]: WOOCOMMERCE_ORDERS_REQUEST === action.type } );
		default:
			return state;
	}
}

/**
 * Returns the updated order requests state after an action has been
 * dispatched. The state reflects a mapping of order ID to a
 * boolean reflecting whether there is a save in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function isUpdating( state = {}, action ) {
	const orderId = isFinite( action.orderId ) ? action.orderId : JSON.stringify( action.orderId );
	switch ( action.type ) {
		case WOOCOMMERCE_ORDER_UPDATE:
		case WOOCOMMERCE_ORDER_UPDATE_SUCCESS:
		case WOOCOMMERCE_ORDER_UPDATE_FAILURE:
			return Object.assign( {}, state, {
				[ orderId ]: WOOCOMMERCE_ORDER_UPDATE === action.type,
			} );
		default:
			return state;
	}
}

/**
 * Tracks all known order objects, indexed by post ID.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function items( state = {}, action ) {
	let orders;
	switch ( action.type ) {
		case WOOCOMMERCE_ORDERS_REQUEST_SUCCESS:
			orders = keyBy( action.orders, 'id' );
			return Object.assign( {}, state, orders );
		case WOOCOMMERCE_ORDER_REQUEST_SUCCESS:
		case WOOCOMMERCE_ORDER_UPDATE_SUCCESS:
			orders = { [ action.order.id ]: action.order };
			return Object.assign( {}, state, orders );
		default:
			return state;
	}
}

/**
 * Tracks the orders which belong to a query, as a list of IDs
 * referencing items in `orders.items`.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function queries( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDERS_REQUEST_SUCCESS:
			const idList = action.orders.map( ( order ) => order.id );
			const query = getSerializedOrdersQuery( action.query );
			return Object.assign( {}, state, { [ query ]: idList } );
		default:
			return state;
	}
}

/**
 * Tracks the total number of pages of orders for the current site.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function total( state = 1, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_ORDERS_REQUEST_SUCCESS:
			const query = getSerializedOrdersQuery( omit( action.query, 'page' ) );
			return Object.assign( {}, state, { [ query ]: action.total } );
		default:
			return state;
	}
}

export default combineReducers( {
	invoice,
	isDeleting,
	isQueryLoading,
	isLoading,
	isUpdating,
	items,
	queries,
	refunds,
	total,
	notes,
} );
