/** @format */

/**
 * Internal dependencies
 */

import wpcom from 'client/lib/wp';
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'client/state/action-types';

export function receiveProductsList( productsList ) {
	return {
		type: PRODUCTS_LIST_RECEIVE,
		productsList,
	};
}

export function requestProductsList() {
	return dispatch => {
		dispatch( { type: PRODUCTS_LIST_REQUEST } );

		return wpcom
			.undocumented()
			.getProducts()
			.then( productsList => dispatch( receiveProductsList( productsList ) ) )
			.catch( error =>
				dispatch( {
					type: PRODUCTS_LIST_REQUEST_FAILURE,
					error,
				} )
			);
	};
}
