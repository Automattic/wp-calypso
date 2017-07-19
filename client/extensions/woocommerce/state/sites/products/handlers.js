/**
 * Internal dependencies
 */
import { get, post, put } from 'woocommerce/state/data-layer/request/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { dispatchWithProps } from 'woocommerce/state/helpers';
import request from 'woocommerce/state/sites/http-request';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import { productUpdated } from 'woocommerce/state/sites/products/actions';
import {
	WOOCOMMERCE_PRODUCT_CREATE,
	WOOCOMMERCE_PRODUCT_UPDATE,
	WOOCOMMERCE_PRODUCT_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_RECEIVE,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_PRODUCT_CREATE ]: [ handleProductCreate ],
	[ WOOCOMMERCE_PRODUCT_UPDATE ]: [ handleProductUpdate ],
	[ WOOCOMMERCE_PRODUCT_REQUEST ]: [ handleProductRequest ],
	[ WOOCOMMERCE_PRODUCTS_REQUEST ]: [ dispatchRequest(
		handleProductsRequest,
		handleProductsRequestSuccess,
		handleProductsRequestError
	) ],
};

/**
 * Wraps an action with a product update action.
 *
 * @param {Number} siteId The id of the site upon which the request should be made.
 * @param {Object} originatingAction The action which precipitated this request.
 * @param {Object} successAction Will be dispatched with extra props: { sentData, receivedData }
 * @param {Object} [sentData] The sentData to be embedded in the successAction along with receivedData.
 * @return {Function} Curried function to be dispatched.
 */
function updatedAction( siteId, originatingAction, successAction, sentData ) {
	return ( dispatch, getState, { data: receivedData } ) => {
		dispatch( productUpdated( siteId, receivedData, originatingAction ) );

		const props = { sentData, receivedData };
		dispatchWithProps( dispatch, getState, successAction, props );
	};
}

export function handleProductCreate( { dispatch }, action ) {
	const { siteId, product, successAction, failureAction } = action;

	// Filter out any id we might have.
	const { id, ...productData } = product;

	if ( typeof id === 'number' ) {
		dispatch( setError( siteId, action, {
			message: 'Attempting to create a product which already has a valid id.',
			product,
		} ) );
		return;
	}

	const updatedSuccessAction = updatedAction( siteId, action, successAction, product );
	dispatch( post( siteId, 'products', productData, updatedSuccessAction, failureAction ) );
}

export function handleProductUpdate( { dispatch }, action ) {
	const { siteId, product, successAction, failureAction } = action;

	// Verify the id
	if ( typeof product.id !== 'number' ) {
		dispatch( setError( siteId, action, {
			message: 'Attempting to update a product without a valid id.',
			product,
		} ) );
		return;
	}

	const updatedSuccessAction = updatedAction( siteId, action, successAction, product );
	dispatch( put( siteId, 'products/' + product.id, product, updatedSuccessAction, failureAction ) );
}

export function handleProductRequest( { dispatch }, action ) {
	const { siteId, productId, successAction, failureAction } = action;

	const updatedSuccessAction = updatedAction( siteId, action, successAction );
	dispatch( get( siteId, 'products/' + productId, updatedSuccessAction, failureAction ) );
}

export function handleProductsRequestSuccess( store, action, next, response ) {
	const { siteId, page } = action;
	const { headers, body, status } = response.data;

	// We needed to envelope the reponse to get the number of products and pages. see handleProductsRequest
	if ( status !== 200 ) {
		return handleProductsRequestError( store, action, next, ( body.code || status ) );
	}

	const totalPages = headers[ 'X-WP-TotalPages' ];
	const totalProducts = headers[ 'X-WP-Total' ];

	store.dispatch( {
		type: WOOCOMMERCE_PRODUCTS_RECEIVE,
		siteId,
		page,
		totalPages,
		totalProducts,
		products: body,
	} );

	return next( action );
}

export function handleProductsRequestError( { dispatch }, action, next, error ) {
	const { siteId, page } = action;
	dispatch( {
		type: WOOCOMMERCE_PRODUCTS_RECEIVE,
		siteId,
		page,
		error,
	} );
	return next( action );
}

export function handleProductsRequest( { dispatch, getState }, action, next ) {
	const { siteId, page } = action;
	// &_envelope is needed because we need X-WP-TotalPages and X-WP-Total
	// from the WC API Response. The wpcom-http getHeaders method only returns headers from the JP proxy, not the end host
	dispatch( request( siteId, action ).get( `products?page=${ page }&per_page=10&_envelope` ) );
	return next( action );
}
