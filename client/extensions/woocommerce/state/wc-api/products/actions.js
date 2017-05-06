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

		const jpProps = { path: `/jetpack-blogs/${ siteId }/rest-api/` };
		const httpProps = {
			path: '/wc/v2/products',
			body: productData,
			json:true
		};

		return wp.req.post( jpProps, httpProps )
			.then( ( { data } ) => {
				console.log( 'data:', data );
				dispatch( createProductSuccess( siteId, product ) );
			} )
			.catch( err => {
				console.log( 'err:', err );
				dispatch( error( siteId, getAction, err ) );
			} );
	};
}

export function createProductSuccess( siteId, product ) {
	if ( ! isValidProduct( product ) ) {
		const originalAction = {
			type: WOOCOMMERCE_API_CREATE_PRODUCT,
			payload: { siteId, product },
		};

		return error( siteId, originalAction, { message: 'Invalid Product Object', product } );
	}

	return {
		type: WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS,
		payload: {
			siteId,
			product,
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

