/**
 * External dependencies
 */

import { withoutPersistence } from 'calypso/state/utils';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { DEFAULT_QUERY } from 'woocommerce/state/sites/products/utils';
import {
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export default withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_PRODUCTS_REQUEST:
			return productsRequest( state, action );
		case WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS:
			return productsRequestSuccess( state, action );
	}

	return state;
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
