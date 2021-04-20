/**
 * External dependencies
 */
import { mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { createProductObject } from './assembler';
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/products-list/init';

export function receiveProductsList( productsList ) {
	return {
		type: PRODUCTS_LIST_RECEIVE,
		productsList: mapValues( productsList, createProductObject ),
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
