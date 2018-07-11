/** @format */

/**
 * External dependencies
 */

import { keyBy, omit, reject } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { getSerializedProductCategoriesQuery } from './utils';
import {
	WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED,
	WOOCOMMERCE_PRODUCT_CATEGORY_DELETED,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';

/**
 * Returns if a product categories request for a specific query is in progress or not.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isQueryLoading( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST:
		case WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS:
		case WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE:
			const query = getSerializedProductCategoriesQuery( action.query );
			return Object.assign( {}, state, {
				[ query ]: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST === action.type,
			} );
		default:
			return state;
	}
}

/**
 * Returns if a product categories request for a specific query has returned an error.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isQueryError( state = {}, action ) {
	if ( WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE === action.type && action.error ) {
		const query = getSerializedProductCategoriesQuery( action.query );
		return Object.assign( {}, state, { [ query ]: true } );
	}

	return state;
}

/**
 * Tracks all known categories objects, indexed by ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	if ( WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS === action.type && action.data ) {
		const cats = keyBy( action.data, 'id' );
		return Object.assign( {}, state, cats );
	}

	if ( WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED === action.type && action.data ) {
		return {
			...state,
			[ action.data.id ]: action.data,
		};
	}

	if ( WOOCOMMERCE_PRODUCT_CATEGORY_DELETED === action.type && action.category ) {
		return keyBy( reject( state, { id: action.category.id } ), 'id' );
	}

	return state;
}

/**
 * Tracks the categories which belong to a query, as a list of IDs
 * referencing items in `productCategories.items`.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queries( state = {}, action ) {
	if ( WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS === action.type && action.data ) {
		const idList = action.data.map( cat => cat.id );
		const query = getSerializedProductCategoriesQuery( action.query );
		return Object.assign( {}, state, { [ query ]: idList } );
	}

	return state;
}

/**
 * Tracks the total number of product categories for the current query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function total( state = {}, action ) {
	if ( WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS === action.type && action.data ) {
		const query = getSerializedProductCategoriesQuery( omit( action.query, [ 'page', 'offset' ] ) );
		return Object.assign( {}, state, { [ query ]: action.total } );
	}

	return state;
}

/**
 * Tracks the total number of pages for the current query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function totalPages( state = {}, action ) {
	if ( WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS === action.type && action.data ) {
		const query = getSerializedProductCategoriesQuery( omit( action.query, [ 'page', 'offset' ] ) );
		return Object.assign( {}, state, { [ query ]: action.totalPages } );
	}

	return state;
}

export default combineReducers( {
	isQueryLoading,
	isQueryError,
	items,
	queries,
	total,
	totalPages,
} );
