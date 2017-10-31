/**
 * External dependencies
 *
 * @format
 */

import { get, reject } from 'lodash';

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
 * Set a given property in state for a param set
 *
 * @param  {Object}  state     The current state
 * @param  {Object}  property  The property to update
 * @param  {Object}  params    Params of the query to update
 * @param  {Boolean} newValue  The new value to save
 * @return {Object}            Updated isLoading state
 */
function setQueryResponse( state, property, params, newValue ) {
	const prevProperties = get( state, property, {} );
	const query = getSerializedProductsQuery( params );
	return {
		...prevProperties,
		[ query ]: newValue,
	};
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
	const isLoading = setQueryResponse( state, 'isLoading', action.params, false );
	const totalPages = setQueryResponse( state, 'totalPages', action.params, action.totalPages );
	const totalProducts = setQueryResponse(
		state,
		'totalProducts',
		action.params,
		action.totalProducts
	);
	let products = get( state, 'products', [] );
	action.products.forEach( function( product ) {
		products = updateCachedProduct( products, product );
	} );

	return {
		...state,
		products,
		isLoading,
		totalPages,
		totalProducts,
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
	const newProducts = reject( products, { id: action.data.id } );
	return {
		...state,
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
	const isLoading = setQueryResponse( state, 'isLoading', action.params, true );
	return { ...state, isLoading };
}

/**
 * Store that the product request has failed
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function productsRequestFailure( state = {}, action ) {
	const isLoading = setQueryResponse( state, 'isLoading', action.params, false );
	return { ...state, isLoading };
}
