/** @format */

/**
 * External dependencies
 */

import { difference, forEach, get, reject } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { getSerializedProductsQuery } from './utils';
import {
	WOOCOMMERCE_PRODUCT_DELETE_SUCCESS,
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
	WOOCOMMERCE_PRODUCT_UPDATED,
} from 'woocommerce/state/action-types';

export default createReducer(
	{},
	{
		[ WOOCOMMERCE_PRODUCT_DELETE_SUCCESS ]: productsDeleteSuccess,
		[ WOOCOMMERCE_PRODUCT_UPDATED ]: productUpdated,
		[ WOOCOMMERCE_PRODUCTS_REQUEST ]: productsRequest,
		[ WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS ]: productsRequestSuccess,
		[ WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE ]: productsRequestFailure,
	}
);

/**
 * Merge a product into the products list
 *
 * @param  {Array}  products A list of products
 * @param  {Object} product  A single product to update or add to the products list
 * @return {Array}         Updated product list
 */
function updateCachedProduct( products, product ) {
	let found = false;
	const newProducts = products.map( p => {
		if ( p.id === product.id ) {
			found = true;
			return product;
		}
		return p;
	} );

	if ( ! found ) {
		newProducts.push( product );
	}

	return newProducts;
}

/**
 * Set the loading status for a param set in state
 *
 * @param  {Object}  state     The current state
 * @param  {Object}  params    Params of the query to update
 * @param  {Boolean} newStatus The new value to save
 * @return {Object}            Updated isLoading state
 */
function setLoading( state, params, newStatus ) {
	const queries = ( state.queries && { ...state.queries } ) || {};
	const key = getSerializedProductsQuery( params );
	queries[ key ] = { ...( queries[ key ] || {} ), isLoading: newStatus };
	return queries;
}

/**
 * Update a single product in the state
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function productUpdated( state, action ) {
	const { data } = action;
	const products = state.products || [];
	return {
		...state,
		products: updateCachedProduct( products, data ),
	};
}

/**
 * Update the product state after products load
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function productsRequestSuccess( state = {}, action ) {
	let products = get( state, 'products', [] );
	action.products.forEach( function( product ) {
		products = updateCachedProduct( products, product );
	} );

	const ids = action.products.map( p => p.id );
	const isLoading = false;
	const totalPages = get( action, 'totalPages', 0 );
	const totalProducts = get( action, 'totalProducts', 0 );

	const query = getSerializedProductsQuery( action.params );
	const prevQueries = get( state, 'queries', {} );
	const queries = {
		...prevQueries,
		[ query ]: {
			ids,
			isLoading,
			totalPages,
			totalProducts,
		},
	};

	return {
		...state,
		products,
		queries,
	};
}

/**
 * Delete a product from the state
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function productsDeleteSuccess( state = {}, action ) {
	const products = get( state, 'products', [] );
	const id = action.data.id;
	const newProducts = reject( products, { id } );
	const newQueries = {};
	forEach( get( state, 'queries', {} ), ( item, key ) => {
		const ids = difference( item.ids, [ id ] );
		newQueries[ key ] = { ...item, ids };
	} );

	return {
		...state,
		queries: newQueries,
		products: newProducts,
	};
}

/**
 * Store that a product request has been started
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function productsRequest( state = {}, action ) {
	const queries = setLoading( state, action.params, true );
	return { ...state, queries };
}

/**
 * Store that the product request has failed
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function productsRequestFailure( state = {}, action ) {
	const queries = setLoading( state, action.params, false );
	return { ...state, queries };
}
