/**
 * External dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import { WOOCOMMERCE_UI_ORDERS_SET_QUERY } from 'woocommerce/state/action-types';

/**
 * Tracks the current page of orders displayed for the current site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function currentPage( state = 1, action ) {
	const { type, query } = action;
	switch ( type ) {
		case WOOCOMMERCE_UI_ORDERS_SET_QUERY:
			return query && query.page ? query.page : state;
		default:
			return state;
	}
}

/**
 * Tracks the current page of orders displayed for the current site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function currentStatus( state = 'any', action ) {
	const { type, query } = action;
	switch ( type ) {
		case WOOCOMMERCE_UI_ORDERS_SET_QUERY:
			return query && query.status ? query.status : state;
		default:
			return state;
	}
}

const ordersReducer = combineReducers( {
	currentPage,
	currentStatus
} );

export default keyedReducer( 'siteId', ordersReducer );
