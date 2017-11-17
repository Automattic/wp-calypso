/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';
import { omitBy } from 'lodash';
import qs from 'querystring';
import warn from 'lib/warn';

/**
 * Internal dependencies
 */
import { dispatchWithProps } from 'woocommerce/state/helpers';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { get, post, put } from 'woocommerce/state/data-layer/request/actions';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import {
	fetchProducts,
	fetchProductsFailure,
	productUpdated,
	productsUpdated,
} from 'woocommerce/state/sites/products/actions';
import request from 'woocommerce/state/sites/http-request';
import {
	WOOCOMMERCE_PRODUCT_CREATE,
	WOOCOMMERCE_PRODUCT_UPDATE,
	WOOCOMMERCE_PRODUCT_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST,
} from 'woocommerce/state/action-types';

const debug = debugFactory( 'woocommerce:products' );

export default {
	[ WOOCOMMERCE_PRODUCT_CREATE ]: [ handleProductCreate ],
	[ WOOCOMMERCE_PRODUCT_UPDATE ]: [ handleProductUpdate ],
	[ WOOCOMMERCE_PRODUCT_REQUEST ]: [ handleProductRequest ],
	[ WOOCOMMERCE_PRODUCTS_REQUEST ]: [
		dispatchRequest( productsRequest, receivedProducts, apiError ),
	],
};

export function apiError( { dispatch }, action, error ) {
	warn( 'Products API Error: ', error );
	dispatch( fetchProductsFailure( action.siteId, action.params ) );

	if ( action.failureAction ) {
		dispatch( action.failureAction );
	}
}

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
		dispatch(
			setError( siteId, action, {
				message: 'Attempting to create a product which already has a valid id.',
				product,
			} )
		);
		return;
	}

	const updatedSuccessAction = updatedAction( siteId, action, successAction, product );
	dispatch( post( siteId, 'products', productData, updatedSuccessAction, failureAction ) );
}

export function handleProductUpdate( { dispatch }, action ) {
	const { siteId, product, successAction, failureAction } = action;

	// Verify the id
	if ( typeof product.id !== 'number' ) {
		dispatch(
			setError( siteId, action, {
				message: 'Attempting to update a product without a valid id.',
				product,
			} )
		);
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

export function productsRequest( { dispatch }, action ) {
	const { siteId, params } = action;
	const queryString = qs.stringify( omitBy( params, val => '' === val ) );

	dispatch( request( siteId, action ).getWithHeaders( `products?${ queryString }` ) );
}

export function receivedProducts( { dispatch }, action, { data } ) {
	const { siteId, params } = action;
	const { body, headers } = data;
	const totalPages = Number( headers[ 'X-WP-TotalPages' ] );
	const totalProducts = Number( headers[ 'X-WP-Total' ] );

	dispatch( productsUpdated( siteId, params, body, totalPages, totalProducts ) );

	if ( undefined !== params.offset ) {
		debug(
			`Products ${ params.offset + 1 }-${ params.offset +
				body.length } out of ${ totalProducts } received.`
		);

		const remainder = totalProducts - params.offset - body.length;
		if ( remainder ) {
			const offset = params.offset + body.length;
			dispatch( fetchProducts( siteId, { ...params, offset } ) );
		}
	}
}
