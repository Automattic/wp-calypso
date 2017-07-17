/*
 * External dependencies
 */
import { uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import {
	SIMPLE_PAYMENTS_PRODUCT_GET,
	SIMPLE_PAYMENTS_PRODUCT_RECEIVE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_ADD,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_DELETE,
} from 'state/action-types';

const waitingRequests = {};

/*
 * Return a Promise that gets resolved or rejected once a response (or error) for
 * the given `requestId` arrives.
 */
export function waitForResponse( requestId ) {
	// Is there already a Promise for this `requestId`? Return it.
	if ( waitingRequests[ requestId ] ) {
		return waitingRequests[ requestId ].promise;
	}

	// Create a new Promise and save references to its `resolve` and `reject` functions
	const waitingRequest = waitingRequests[ requestId ] = {};
	waitingRequest.promise = new Promise( ( resolve, reject ) => {
		waitingRequest.resolve = resolve;
		waitingRequest.reject = reject;
	} );

	return waitingRequest.promise;
}

export const requestProducts = ( siteId ) => ( {
	siteId,
	type: SIMPLE_PAYMENTS_PRODUCTS_LIST,
} );

export const requestProduct = ( siteId, productId ) => ( {
	siteId,
	productId,
	type: SIMPLE_PAYMENTS_PRODUCT_GET,
} );

export const addProduct = ( siteId, product ) => ( {
	type: SIMPLE_PAYMENTS_PRODUCTS_LIST_ADD,
	requestId: uniqueId( 'request_' ),
	siteId,
	product,
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

export function receiveUpdateProduct( siteId, product, requestId ) {
	return dispatch => {
		dispatch( {
			type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE,
			siteId,
			requestId,
			product,
		} );

		// If there is someone waiting for this response, resolve the promise
		if ( requestId ) {
			const waitingRequest = waitingRequests[ requestId ];
			if ( waitingRequest ) {
				waitingRequest.resolve( product );
				delete waitingRequests[ requestId ];
			}
		}
	};
}

export function receiveUpdateProductError( siteId, error, requestId ) {
	return () => {
		// If there is someone waiting for the error response, reject the promise
		if ( requestId ) {
			const waitingRequest = waitingRequests[ requestId ];
			if ( waitingRequest ) {
				waitingRequest.reject( error );
				delete waitingRequests[ requestId ];
			}
		}
	};
}

export function receiveDeleteProduct( siteId, productId ) {
	return {
		siteId,
		productId,
		type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_DELETE,
	};
}
