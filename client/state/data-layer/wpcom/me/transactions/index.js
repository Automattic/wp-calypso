/** @format */

/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { convertToCamelCase } from 'state/data-layer/utils';
import { TRANSACTION_CREATE, TRANSACTION_CREATE_SUCCESS, TRANSACTION_CREATE_FAILURE } from 'state/action-types';

export const createTransaction = function( { dispatch }, action ) {
	const request = {
		path: `/me/transactions`,
		method: 'POST',
		apiNamespace: 'rest/v1',
		query: Object.assign( {}, {	http_envelope: 1 }, action ),
	};

	dispatch( http( request, action ) );
};

export const handleError = ( { dispatch }, action, error ) => dispatch( {
	type: TRANSACTION_CREATE_FAILURE,
	message: error.message
} );


export const handleSuccess = ( { dispatch }, action, response ) => dispatch( {
	type: TRANSACTION_CREATE_SUCCESS,
	...response
} );

export default {
	[ TRANSACTION_CREATE ]: [
		dispatchRequest( createTransaction, handleSuccess, handleError, { fromApi: convertToCamelCase } )
	],
};
