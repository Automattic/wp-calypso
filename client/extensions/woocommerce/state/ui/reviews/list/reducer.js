/** @format */

/**
 * External dependencies
 */

import { combineReducers } from 'client/state/utils';
import { WOOCOMMERCE_UI_REVIEWS_SET_QUERY } from 'client/extensions/woocommerce/state/action-types';

/**
 * Tracks the current page of reviews displayed for the current site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function currentPage( state = 1, action ) {
	const { type, query } = action;
	if ( WOOCOMMERCE_UI_REVIEWS_SET_QUERY === type ) {
		return query && query.page ? query.page : state;
	}
	return state;
}

/**
 * Tracks the current product, if filtering reviews by a specific product.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function currentProduct( state = null, action ) {
	const { type, query } = action;
	if ( WOOCOMMERCE_UI_REVIEWS_SET_QUERY === type ) {
		return query && query.product ? query.product : state;
	}
	return state;
}

/**
 * Tracks the current search term being displayed for the current site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function currentSearch( state = '', action ) {
	const { type, query } = action;
	if ( WOOCOMMERCE_UI_REVIEWS_SET_QUERY === type ) {
		return query && 'undefined' !== typeof query.search ? query.search : state;
	}
	return state;
}

export default combineReducers( {
	currentPage,
	currentProduct,
	currentSearch,
} );
