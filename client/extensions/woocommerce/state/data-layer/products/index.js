/**
 * Internal dependencies
 */
import request from 'woocommerce/state/wc-api/request';
import { setError } from 'woocommerce/state/site/status/wc-api/actions';
import { productUpdated } from 'woocommerce/state/wc-api/products/actions';
import {
	WOOCOMMERCE_API_CREATE_PRODUCT,
	WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS,
} from 'woocommerce/state/action-types';

function createProduct( { dispatch }, action, next ) {
	const { siteId, product, successAction, errorAction } = action;

	// Filter out any id we might have.
	const { id, ...productData } = product;

	if ( typeof id === 'number' ) {
		dispatch( setError( siteId, action, {
			message: 'Attempting to create a product which already has a valid id.',
			product,
		} ) );
		return;
	}

	request( siteId ).post( 'products', productData )
		.then( data => {
			dispatch( {
				type: WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS,
				siteId,
				data,
				successAction,
			} );
		} )
		.catch( err => {
			dispatch( setError( siteId, action, { message: err.toString() } ) );

			if ( errorAction ) {
				dispatch( errorAction );
			}
		} );

	return next( action );
}

function createProductSuccess( { dispatch }, action ) {
	const { siteId, data, successAction, errorAction } = action;

	if ( isValidProduct( data ) ) {
		dispatch( productUpdated( siteId, data ) );

		if ( successAction ) {
			dispatch( successAction );
		}
	} else {
		dispatch( setError( siteId, action, {
			message: 'Invalid Product Object',
			data
		} ) );

		if ( errorAction ) {
			dispatch( errorAction );
		}
	}
}

function isValidProduct( product ) {
	return (
		product &&
		product.id && ( 'number' === typeof product.id ) &&
		product.type && ( 'string' === typeof product.type )
	);
}

export default {
	[ WOOCOMMERCE_API_CREATE_PRODUCT ]: [ createProduct ],
	[ WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS ]: [ createProductSuccess ],
};

