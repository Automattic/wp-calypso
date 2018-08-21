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
import { TRANSACTION_CREATE_REQUEST } from 'state/action-types';
import { setCreateTransactionResponse, setCreateTransactionError } from 'state/transactions/actions';

export const createTransaction = ( action ) => http(
	{
		path: '/me/transactions',
		method: 'POST',
		apiNamespace: 'rest/v1',
		query: Object.assign( {}, { http_envelope: 1 }, action.request )
	},
	action
);

export default {
	[ TRANSACTION_CREATE_REQUEST ]: [
		dispatchRequestEx( {
			fetch: createTransaction,
			onSuccess: setCreateTransactionResponse,
			onError: setCreateTransactionError,
			fromApi
		} )
	]
};
