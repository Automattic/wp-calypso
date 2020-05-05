/**
 * External dependencies
 */
import { mapValues } from 'lodash';

/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import { createProductObject } from './assembler';
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'state/action-types';

export function receiveProductsList( productsList ) {
	return {
		type: PRODUCTS_LIST_RECEIVE,
		productsList: mapValues( productsList, createProductObject ),
	};
}

export function requestProductsList() {
	return ( dispatch ) => {
		dispatch( { type: PRODUCTS_LIST_REQUEST } );

		return wpcom
			.undocumented()
			.getProducts()
			.then( ( productsList ) => dispatch( receiveProductsList( productsList ) ) )
			.catch( ( error ) =>
				dispatch( {
					type: PRODUCTS_LIST_REQUEST_FAILURE,
					error,
				} )
			);
	};
}
