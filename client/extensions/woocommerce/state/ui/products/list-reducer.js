/** @format */

/**
 * External dependencies
 */

import { createReducer } from 'state/utils';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { DEFAULT_QUERY } from 'woocommerce/state/sites/products/utils';
import {
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_PRODUCTS_REQUEST ]: productsRequest,
	[ WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS ]: productsRequestSuccess,
} );

export function productsRequestSuccess( state = {}, action ) {
	// If not set in the action, default to the defaults
	const page = get( action, 'params.page', DEFAULT_QUERY.page );
	const search = get( action, 'params.search', DEFAULT_QUERY.search );

	return {
		...state,
		currentPage: page,
		currentSearch: search,
		requestedPage: null,
		requestedSearch: null,
	};
}

export function productsRequest( state = {}, action ) {
	const page = get( action, 'params.page', null );
	const search = get( action, 'params.search', null );

	return {
		...state,
		requestedPage: page,
		requestedSearch: search,
	};
}
