/**
 * Internal dependencies
 */
import {
	ORDER_TRANSACTION_FETCH,
	ORDER_TRANSACTION_FETCH_ERROR,
	ORDER_TRANSACTION_SET,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/me/transactions/order';
import 'calypso/state/order-transactions/init';

export const fetchOrderTransaction = ( orderId ) => ( {
	type: ORDER_TRANSACTION_FETCH,
	orderId,
} );

export const setOrderTransaction = ( orderId, transaction ) => ( {
	type: ORDER_TRANSACTION_SET,
	orderId,
	transaction,
} );

export const setOrderTransactionError = ( orderId, error ) => ( {
	type: ORDER_TRANSACTION_FETCH_ERROR,
	orderId,
	error,
} );
