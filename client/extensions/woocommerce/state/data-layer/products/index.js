/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { setError } from '../../site/status/wc-api/actions';
import {
	WOOCOMMERCE_API_CREATE_PRODUCT,
	WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS,
} from '../../action-types';

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
	const { siteId } = action.payload;
	const { data } = response;

	if ( ! isValidProduct( data ) ) {
		dispatch( setError( siteId, action, {
			message: 'Invalid Product Object',
			data
		} ) );
	}

	dispatch( {
		type: WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS,
		payload: {
			siteId,
			data,
		}
	} );

	return next( action );
}

function createProductFailure( { dispatch }, action, next, err ) {
	const { siteId } = action.payload;

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

