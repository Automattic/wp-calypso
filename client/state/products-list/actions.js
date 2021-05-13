/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { ensureNumericCost } from './assembler';

import 'calypso/state/products-list/init';

export function receiveProductsList( productsList ) {
	// Since the request succeeded, productsList should be guaranteed non-null;
	// thus, we don't have any safety checks before this line.

	// Create a completely new products list to avoid mutating the original
	const sanitizedProductsList = Object.fromEntries(
		Object.entries( productsList ).map( ( [ slug, product ] ) => [
			slug,
			ensureNumericCost( product ),
		] )
	);

	return {
		type: PRODUCTS_LIST_RECEIVE,
		productsList: sanitizedProductsList,
	};
}

/**
 * Requests the list of all products from the WPCOM API.
 *
 * @param   {object} [query={}] A list of request parameters.
 * @param   {string} query.type The type of products to request (e.g., "jetpack");
 * 								or undefined, for all products
 * @returns {Function} 			an Action thunk
 */
export function requestProductsList( query = {} ) {
	return ( dispatch ) => {
		dispatch( { type: PRODUCTS_LIST_REQUEST } );

		return wpcom.req
			.get( '/products', query )
			.then( ( productsList ) => dispatch( receiveProductsList( productsList ) ) )
			.catch( ( error ) =>
				dispatch( {
					type: PRODUCTS_LIST_REQUEST_FAILURE,
					error,
				} )
			);
	};
}
