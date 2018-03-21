/** @format */

/**
 * Internal dependencies
 */
import { SOURCE_PAYMENT_TRANSACTION_DETAIL_FETCH } from 'state/action-types';

export const fetchSourcePaymentTransactionDetail = orderId => ( {
	type: SOURCE_PAYMENT_TRANSACTION_DETAIL_FETCH,
	orderId,
} );
