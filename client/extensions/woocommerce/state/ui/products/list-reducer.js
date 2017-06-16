/**
 * External dependencies
 */
import { createReducer } from 'state/utils';

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

export function productsRequestSuccess( state, action ) {
	const prevState = state || {};
	const { page, products } = action;
	const productIds = products.map( ( p ) => {
		return p.id;
	} );
	return { ...prevState,
		currentPage: page,
		productIds,
		requestedPage: null,
	};
}

export function productsRequest( state, action ) {
	const prevState = state || {};
	const { page } = action;
	return { ...prevState,
		requestedPage: page,
	};
}
