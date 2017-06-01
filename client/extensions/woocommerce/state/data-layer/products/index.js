/**
 * Internal dependencies
 */
import wp from 'lib/wp';
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

	const jetpackProps = { path: `/jetpack-blogs/${ siteId }/rest-api/` };
	const httpProps = {
		path: '/wc/v2/products',
		body: JSON.stringify( productData ),
		json: true,
	};

	wp.req.post( jetpackProps, httpProps )
		.then( ( { data } ) => {
			dispatch( createProductSuccess( siteId, data ) );
		} )
		.catch( err => {
			dispatch( setError( siteId, action, err ) );
		} );

	return next( action );
}

export function createProductSuccess( siteId, product ) {
	if ( ! isValidProduct( product ) ) {
		const originalAction = {
			type: WOOCOMMERCE_API_CREATE_PRODUCT,
			payload: { siteId, product },
		};

		return setError( siteId, originalAction, {
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

export default {
	[ WOOCOMMERCE_API_CREATE_PRODUCT ]: [ createProduct ],
};

