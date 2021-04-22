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
	const sanitizedProductsList = Object.entries( productsList ).reduce(
		( acc, [ slug, product ] ) => {
			acc[ slug ] = ensureNumericCost( product );
			return acc;
		},
		{}
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

		return wpcom
			.undocumented()
			.getProducts( query )
			.then( ( productsList ) => dispatch( receiveProductsList( productsList ) ) )
			.catch( ( error ) =>
				dispatch( {
					type: PRODUCTS_LIST_REQUEST_FAILURE,
					error,
				} )
			);
	};
}
