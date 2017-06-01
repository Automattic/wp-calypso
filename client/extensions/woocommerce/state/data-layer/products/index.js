/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { setError } from 'woocommerce/state/site/status/wc-api/actions';
import {
	WOOCOMMERCE_API_CREATE_PRODUCT,
} from 'woocommerce/state/action-types';

function createProduct( { dispatch }, action, next ) {
	const { siteId, product } = action.payload;

	// Filter out any id we might have.
	const { id, ...productData } = product;

	if ( typeof id === 'number' ) {
		dispatch( setError( siteId, action, {
			message: 'Attempting to create a product which already has a valid id.',
			product,
		} ) );
	}

	const httpProps = {
		path: '/wc/v2/products',
		body: JSON.stringify( productData ),
		json: true,
	};

	dispatch( http( {
		apiVersion: '1.1',
		path: `/jetpack-blogs/${ siteId }/rest-api/`,
		method: 'POST',
		query: httpProps,
	}, action ) );

	return next( action );
}

function createProductSuccess( { dispatch }, action, next, response ) {
	const { siteId, successAction } = action.payload;
	const { data } = response;

	if ( isValidProduct( data ) ) {
		if ( successAction ) {
			dispatch( successAction );
		}
	} else {
		dispatch( setError( siteId, action, {
			message: 'Invalid Product Object',
			data
		} ) );
	}

	return next( action );
}

function createProductFailure( { dispatch }, action, next, err ) {
	const { siteId, errorAction } = action.payload;

	if ( errorAction ) {
		dispatch( errorAction );
	}
	dispatch( setError( siteId, action, err ) );

	return next( action );
}

function isValidProduct( product ) {
	return (
		product &&
		product.id && ( 'number' === typeof product.id ) &&
		product.type && ( 'string' === typeof product.type )
	);
}

export default {
	[ WOOCOMMERCE_API_CREATE_PRODUCT ]: [
		dispatchRequest(
			createProduct,
			createProductSuccess,
			createProductFailure
		)
	],
};

