/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
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
 * Tracks the current search term used for the current site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function currentSearch( state = '', action ) {
	const { type, query } = action;
	switch ( type ) {
		case WOOCOMMERCE_UI_ORDERS_SET_QUERY:
			return query && ( 'undefined' !== typeof query.search ) ? query.search : state;
		default:
			return state;
	}
}

export default combineReducers( {
	currentPage,
	currentSearch
} );
