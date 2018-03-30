/** @format */

/**
 * Internal dependencies
 */
import { ORDER_TRANSACTION_FETCH, ORDER_TRANSACTION_SET } from 'state/action-types';

export const fetchOrderTransaction = orderId => ( {
	type: ORDER_TRANSACTION_FETCH,
	orderId,
} );

export const setOrderTransaction = ( orderId, detail ) => ( {
	type: ORDER_TRANSACTION_SET,
	orderId,
	detail,
} );
