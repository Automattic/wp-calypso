/**
 * External dependencies
 *
 * @format
 */

import { createReducer } from 'state/utils';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_PRODUCTS_REQUEST ]: productsRequest,
	[ WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS ]: productsRequestSuccess,
} );

export function productsRequestSuccess( state = {}, action ) {
	const page = get( action, 'params.page', null );
	const search = get( action, 'params.search', null );

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
