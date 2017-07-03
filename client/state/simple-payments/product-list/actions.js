/**
 * Internal dependencies
 */
import {
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_REQUESTING,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_SUCCESS,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_FAIL,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_DELETE,
} from 'state/action-types';

export function receiveProductsList( siteId, found, posts ) {
	return {
		type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE,
		siteId,
		products: posts,
	};
}

export function requestingProductList( siteId ) {
	return {
		type: SIMPLE_PAYMENTS_PRODUCTS_LIST_REQUESTING,
		siteId
	};
}

export function successProductListRequest( siteId ) {
	return {
		siteId,
		type: SIMPLE_PAYMENTS_PRODUCTS_LIST_SUCCESS
	};
}

export function failProductListRequest( siteId, err ) {
	return {
		siteId,
		type: SIMPLE_PAYMENTS_PRODUCTS_LIST_FAIL,
		err
	};
}

export function receiveUpdateProduct( siteId, product ) {
	return {
		siteId,
		type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE,
		product
	};
}

export function receiveDeleteProduct( siteId, productId ) {
	return {
		siteId,
		productId,
		type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_DELETE,
	};
}
