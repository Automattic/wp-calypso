/** @format */

/**
 * Internal dependencies
 */
import {
	SOURCE_PAYMENT_TRANSACTION_DETAIL_FETCH,
	SOURCE_PAYMENT_TRANSACTION_DETAIL_SET,
} from 'state/action-types';

export const fetchSourcePaymentTransactionDetail = orderId => ( {
	type: SOURCE_PAYMENT_TRANSACTION_DETAIL_FETCH,
	orderId,
} );

export const setSourcePaymentTransactionDetail = ( orderId, detail ) => ( {
	type: SOURCE_PAYMENT_TRANSACTION_DETAIL_SET,
	orderId,
	detail,
} );
