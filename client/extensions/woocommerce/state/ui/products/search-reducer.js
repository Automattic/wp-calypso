/** @format */
/**
 * External dependencies
 */
import { createReducer } from 'state/utils';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST,
	WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCTS_SEARCH_CLEAR,
} from 'woocommerce/state/action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST ]: productsSearchRequest,
	[ WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS ]: productsSearchRequestSuccess,
	[ WOOCOMMERCE_PRODUCTS_SEARCH_CLEAR ]: productsSearchClear,
} );

export function productsSearchRequestSuccess( state, action ) {
	const prevState = state || {};
	const { page, products } = action;
	const productIds =
		( products &&
			products.map( p => {
				return p.id;
			} ) ) ||
		[];
	return {
		...prevState,
		currentPage: page,
		productIds,
		requestedPage: null,
	};
}

export function productsSearchRequest( state, action ) {
	const prevState = state || {};
	const { page } = action;
	return {
		...prevState,
		requestedPage: page,
	};
}

export function productsSearchClear() {
	return {};
}
