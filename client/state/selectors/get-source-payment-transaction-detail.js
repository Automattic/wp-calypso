/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export const getSourcePaymentTransactionDetail = ( state, orderId ) =>
	get( state, [ 'transactions', 'sourcePayment', orderId ], null );

export default getSourcePaymentTransactionDetail;
