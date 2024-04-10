import wpcom from 'calypso/lib/wp';
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { ensureNumericCost } from './assembler';

import 'calypso/state/currency-code/init';
import 'calypso/state/products-list/init';

export function receiveProductsList( productsList, type = null ) {
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
		productsListType: type,
	};
}

/**
 * Requests the list of all products from the WPCOM API.
 * @param   {Object} [query] A list of request parameters.
 * @param   {string} query.type The type of products to request (e.g., "jetpack");
 * @param   {string[]} [query.product_slugs] The specific products being requested. Optional.
 *
 * 								or undefined, for all products
 * @returns {Function} 			an Action thunk
 */
export function requestProductsList( query = {} ) {
	const requestQuery = { ...query };
	if ( query.product_slugs && query.product_slugs.length > 0 ) {
		const product_slugs = query.product_slugs?.join( ',' );
		requestQuery.product_slugs = product_slugs;
	}
	return ( dispatch ) => {
		dispatch( { type: PRODUCTS_LIST_REQUEST } );

		return wpcom.req
			.get( '/products', requestQuery )
			.then( ( productsList ) => dispatch( receiveProductsList( productsList, query.type ) ) )
			.catch( ( error ) =>
				dispatch( {
					type: PRODUCTS_LIST_REQUEST_FAILURE,
					error,
				} )
			);
	};
}
