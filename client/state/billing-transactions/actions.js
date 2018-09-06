/** @format */

/**
 * Internal dependencies
 */

import {
	BILLING_CONTACT_DETAILS_RECEIVE,
	BILLING_CONTACT_DETAILS_REQUEST,
	BILLING_CONTACT_DETAILS_REQUEST_FAILURE,
	BILLING_CONTACT_DETAILS_REQUEST_SUCCESS,
	BILLING_CONTACT_DETAILS_UPDATE,
	BILLING_RECEIPT_EMAIL_SEND,
	BILLING_RECEIPT_EMAIL_SEND_FAILURE,
	BILLING_RECEIPT_EMAIL_SEND_SUCCESS,
	BILLING_TRANSACTIONS_RECEIVE,
	BILLING_TRANSACTIONS_REQUEST,
	BILLING_TRANSACTIONS_REQUEST_FAILURE,
	BILLING_TRANSACTIONS_REQUEST_SUCCESS,
} from 'state/action-types';
import wp from 'lib/wp';

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
					past: billing_history,
					upcoming: upcoming_charges,
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

/**
 * Triggers a network request to query billing contact details
 * @returns {Function}          Action thunk
 */
export function requestBillingContactDetails() {
	return dispatch => {
		dispatch( {
			type: BILLING_CONTACT_DETAILS_REQUEST,
		} );

		wpcom.undocumented().getBillingContactInformation( ( error, data ) => {
			if ( error ) {
				dispatch( {
					type: BILLING_CONTACT_DETAILS_REQUEST_FAILURE,
					error,
				} );
				return;
			}

			dispatch( {
				type: BILLING_CONTACT_DETAILS_RECEIVE,
				data,
			} );
			dispatch( {
				type: BILLING_CONTACT_DETAILS_REQUEST_SUCCESS,
			} );
		} );
	};
}

export function updateBillingContactDetails( data ) {
	return {
		type: BILLING_CONTACT_DETAILS_UPDATE,
		data,
	};
};
