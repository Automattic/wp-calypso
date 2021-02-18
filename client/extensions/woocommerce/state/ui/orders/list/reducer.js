/**
 * External dependencies
 */

import { combineReducers } from 'calypso/state/utils';
import { WOOCOMMERCE_UI_ORDERS_SET_QUERY } from 'woocommerce/state/action-types';

/**
 * Tracks the current page of orders displayed for the current site.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
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
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function currentSearch( state = '', action ) {
	const { type, query } = action;
	switch ( type ) {
		case WOOCOMMERCE_UI_ORDERS_SET_QUERY:
			return query && 'undefined' !== typeof query.search ? query.search : state;
		default:
			return state;
	}
}

export default combineReducers( {
	currentPage,
	currentSearch,
} );
