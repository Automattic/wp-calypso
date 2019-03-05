/** @format */

/**
 * Internal dependencies
 */

import {
	BILLING_RECEIPT_EMAIL_SEND,
	BILLING_RECEIPT_EMAIL_SEND_FAILURE,
	BILLING_RECEIPT_EMAIL_SEND_SUCCESS,
	BILLING_TRANSACTIONS_RECEIVE,
	BILLING_TRANSACTIONS_REQUEST,
	BILLING_TRANSACTIONS_REQUEST_FAILURE,
	BILLING_TRANSACTIONS_REQUEST_SUCCESS,
} from 'state/action-types';
import wp from 'lib/wp';
import { maybeInjectPlaceholderTaxAmountIntoCharges } from 'lib/tax';

export const requestBillingTransactions = () => {
	return dispatch => {
		dispatch( {
			type: BILLING_TRANSACTIONS_REQUEST,
		} );

		return wp
			.undocumented()
			.me()
			.billingHistory()
			.then( ( { billing_history, upcoming_charges } ) => {
				dispatch( {
					type: BILLING_TRANSACTIONS_RECEIVE,
					// #tax-on-checkout-placeholder
					past: maybeInjectPlaceholderTaxAmountIntoCharges( billing_history ),
					upcoming: maybeInjectPlaceholderTaxAmountIntoCharges( upcoming_charges ),
				} );
				dispatch( {
					type: BILLING_TRANSACTIONS_REQUEST_SUCCESS,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: BILLING_TRANSACTIONS_REQUEST_FAILURE,
					error,
				} );
			} );
	};
};

export const sendBillingReceiptEmail = receiptId => {
	return dispatch => {
		dispatch( {
			type: BILLING_RECEIPT_EMAIL_SEND,
			receiptId,
		} );

		return wp
			.undocumented()
			.me()
			.billingHistoryEmailReceipt( receiptId )
			.then( () => {
				dispatch( {
					type: BILLING_RECEIPT_EMAIL_SEND_SUCCESS,
					receiptId,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: BILLING_RECEIPT_EMAIL_SEND_FAILURE,
					receiptId,
					error,
				} );
			} );
	};
};
