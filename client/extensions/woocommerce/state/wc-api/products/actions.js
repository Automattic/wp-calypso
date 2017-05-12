/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import { error } from '../actions';
import {
	WOOCOMMERCE_API_CREATE_PRODUCT,
	WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS,
} from '../../action-types';

export function createProduct( siteId, product ) {
	return ( dispatch ) => {
		const createAction = {
			type: WOOCOMMERCE_API_CREATE_PRODUCT,
			payload: { siteId, product },
		};

		dispatch( createAction );

		// Filter out any id we might have.
		const { id, ...productData } = product;

		if ( typeof id === 'number' ) {
			dispatch( error( siteId, createAction, {
				message: 'Attempting to create a product which already has a valid id.',
				product,
			} ) );
			return;
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
			} )
			.catch( err => {
				dispatch( error( siteId, createAction, err ) );
			} );
	};
}

export function createProductSuccess( siteId, product ) {
	if ( ! isValidProduct( product ) ) {
		const originalAction = {
			type: WOOCOMMERCE_API_CREATE_PRODUCT,
			payload: { siteId, product },
		};

		return error( siteId, originalAction, {
			message: 'Invalid Product Object',
			product
		} );
	}

	return {
		type: WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS,
		payload: {
			siteId,
			product,
		}
	};
}

function isValidProduct( product ) {
	return (
		product &&
		product.id && ( 'number' === typeof product.id ) &&
		product.type && ( 'string' === typeof product.type )
	);
}

