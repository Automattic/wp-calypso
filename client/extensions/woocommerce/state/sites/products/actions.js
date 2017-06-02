/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_API_CREATE_PRODUCT,
	WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS,
} from 'woocommerce/state/action-types';

/**
 * API call to create a product within designated WooCommerce site.
 *
 * @param {Number} siteId The Jetpack Site ID for the WooCommerce WordPress site.
 * @param {Object} product The product data to be created.
 * @param {Function} successAction Action creator, runs upon success, format of `function( data )`
 * @param {Function} failureAction Action creator, runs upon failure, format of `function( err )`
 * @returns {Object|Function} Object or thunk to be dispatched
 */
export function createProduct( siteId, product, successAction = null, failureAction = null ) {
	return ( dispatch ) => {
		const createAction = {
			type: WOOCOMMERCE_API_CREATE_PRODUCT,
			siteId,
			product,
		};

		dispatch( createAction );

		// Filter out any id we might have.
		const { id, ...productData } = product;

		if ( typeof id === 'number' ) {
			return setError( siteId, createAction, {
				message: 'Attempting to create a product which already has a valid id.',
				product,
			} );
		}

		const jetpackProps = { path: `/jetpack-blogs/${ siteId }/rest-api/` };
		const httpProps = {
			path: '/wc/v2/products',
			body: JSON.stringify( productData ),
			json: true,
		};

		// TODO: Modify this to use the extensions data layer.
		return wp.req.post( jetpackProps, httpProps )
			.then( ( { data } ) => {
				dispatch( createProductSuccess( siteId, data ) );
				if ( successAction ) {
					dispatch( successAction( data ) );
				}
			} )
			.catch( err => {
				dispatch( setError( siteId, createAction, err ) );
				if ( failureAction ) {
					dispatch( failureAction( err ) );
				}
			} );
	};
}

export function createProductSuccess( siteId, product ) {
	if ( ! isValidProduct( product ) ) {
		const originalAction = {
			type: WOOCOMMERCE_API_CREATE_PRODUCT,
			siteId,
			product,
		};

		return setError( siteId, originalAction, {
			message: 'Invalid Product Object',
			product
		} );
	}

	return {
		type: WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS,
		siteId,
		product,
	};
}

function isValidProduct( product ) {
	return (
		product &&
		product.id && ( 'number' === typeof product.id ) &&
		product.type && ( 'string' === typeof product.type )
	);
}
