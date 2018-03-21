/** @format */
/**
 * Internal dependencies
 */
import {
	BILLING_TRANSACTION_REQUEST,
	BILLING_TRANSACTION_REQUEST_FAILURE,
	BILLING_TRANSACTION_REQUEST_SUCCESS,
} from 'state/action-types';
import wp from 'lib/wp';

export const requestBillingTransaction = transactionId => dispatch => {
	dispatch( {
		type: BILLING_TRANSACTION_REQUEST,
		transactionId,
	} );

	return wp
		.undocumented()
		.me()
		.getReceipt( transactionId, { format: 'display' } )
		.then( receipt => {
			dispatch( {
				type: BILLING_TRANSACTION_REQUEST_SUCCESS,
				transactionId,
				receipt,
			} );
		} )
		.catch( error => {
			dispatch( {
				type: BILLING_TRANSACTION_REQUEST_FAILURE,
				transactionId,
				error,
			} );
		} );
};

export const clearBillingTransactionError = receiptId => ( {
	type: BILLING_TRANSACTION_REQUEST_FAILURE,
	receiptId,
	error: false,
} );
