/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { setOrderTransaction, setOrderTransactionError } from 'state/order-transactions/actions';
import { ORDER_TRANSACTION_FETCH } from 'state/action-types';
import fromApi from './from-api';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const fetchOrderTransaction = ( action ) =>
	http(
		{
			path: `/me/transactions/order/${ action.orderId }`,
			method: 'GET',
			apiNamespace: 'rest/v1',
			// At the moment, we have to pass this explicitly for rest/v1 APIs.
			// It is actually not ideal since it should work with or without http envelope.
			query: {
				http_envelope: 1,
			},
		},
		action
	);

export const onSuccess = ( { orderId }, detail ) => setOrderTransaction( orderId, detail );

export const onError = ( { orderId }, error ) => setOrderTransactionError( orderId, error );

registerHandlers( 'state/data-layer/wpcom/me/transactions/order/index.js', {
	[ ORDER_TRANSACTION_FETCH ]: [
		dispatchRequest( {
			fetch: fetchOrderTransaction,
			onSuccess,
			onError,
			fromApi,
		} ),
	],
} );
