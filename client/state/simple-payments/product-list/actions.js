/**
 * Internal dependencies
 */

import {
	SIMPLE_PAYMENTS_PRODUCT_GET,
	SIMPLE_PAYMENTS_PRODUCTS_LIST,
	SIMPLE_PAYMENTS_PRODUCT_RECEIVE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_DELETE,
} from 'state/action-types';

import 'state/data-layer/wpcom/sites/simple-payments';

export const requestProducts = ( siteId ) => ( {
	siteId,
	type: SIMPLE_PAYMENTS_PRODUCTS_LIST,
} );

export const requestProduct = ( siteId, productId ) => ( {
	siteId,
	productId,
	type: SIMPLE_PAYMENTS_PRODUCT_GET,
} );

export function receiveProductsList( siteId, posts ) {
	return {
		type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE,
		siteId,
		products: posts,
	};
}

export function receiveProduct( siteId, product ) {
	return {
		siteId,
		product,
		type: SIMPLE_PAYMENTS_PRODUCT_RECEIVE,
	};
}

export function receiveUpdateProduct( siteId, product ) {
	return {
		siteId,
		type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE,
		product,
	};
}

export function receiveDeleteProduct( siteId, productId ) {
	return {
		siteId,
		productId,
		type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_DELETE,
	};
}
