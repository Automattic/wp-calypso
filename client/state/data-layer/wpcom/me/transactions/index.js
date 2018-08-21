/** @format */

/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { convertToCamelCase as fromApi } from 'state/data-layer/utils';
import { TRANSACTION_CREATE_REQUEST, TRANSACTION_CREATE_SUCCESS, TRANSACTION_CREATE_FAILURE } from 'state/action-types';

export const createTransaction = ( action ) => http(
	{
		path: '/me/transactions',
		method: 'POST',
		apiNamespace: 'rest/v1',
		query: Object.assign( {}, {	http_envelope: 1 }, action )
	},
	action
);

export const createError = ( action, error ) => ( {
	type: TRANSACTION_CREATE_FAILURE,
	message: error.message
} );


export const createSuccess = ( action, response ) => ( {
	type: TRANSACTION_CREATE_SUCCESS,
	...response
} );

export default {
	[ TRANSACTION_CREATE_REQUEST ]: [
		dispatchRequestEx( {
			fetch: createTransaction,
			onSuccess: createSuccess,
			onError: createError,
			fromApi
		} )
	]
};
