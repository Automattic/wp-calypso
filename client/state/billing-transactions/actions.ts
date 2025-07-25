import { translate } from 'i18n-calypso';
import wp from 'calypso/lib/wp';
import {
	BILLING_TRANSACTIONS_RECEIVE,
	BILLING_TRANSACTIONS_REQUEST,
	BILLING_TRANSACTIONS_REQUEST_FAILURE,
	BILLING_TRANSACTIONS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import type { BillingTransaction, BillingTransactionsType, UpcomingCharge } from './types';
import type { CalypsoDispatch } from '../types';

import 'calypso/state/billing-transactions/init';

export const requestBillingTransactions = ( transactionType?: BillingTransactionsType ) => {
	return async ( dispatch: CalypsoDispatch ) => {
		dispatch( {
			type: BILLING_TRANSACTIONS_REQUEST,
		} );

		const limit = 600;
		let url = '/me/billing-history' + ( transactionType ? `/${ transactionType }` : '' );
		if ( transactionType !== 'upcoming' ) {
			url = url + '?limit=' + limit;
		}

		try {
			const {
				billing_history,
				upcoming_charges,
				billing_history_total,
			}: {
				billing_history?: BillingTransaction[];
				upcoming_charges?: UpcomingCharge[];
				billing_history_total?: number;
			} = await wp.req.get( url, {
				apiVersion: '1.3',
			} );
			let billingHistoryTotal = billing_history_total ?? 0;
			const fullBillingHistory = billing_history ?? [];
			if ( fullBillingHistory.length === limit && billingHistoryTotal !== limit ) {
				// If we have exactly the limit number of transactions (and this is not the full total), it means there are more transactions to fetch.
				while ( fullBillingHistory.length < billingHistoryTotal ) {
					// Fetch the next page of transactions.
					const offset_url = url + '&offset=' + fullBillingHistory.length;

					const res = await wp.req.get( offset_url, {
						apiVersion: '1.3',
					} );

					const newBillingHistoryChunk = res.billing_history ?? [];
					if ( newBillingHistoryChunk.length === 0 ) {
						// Prevent potential infinite loop if no more transactions are returned.
						break;
					}
					fullBillingHistory.push( ...newBillingHistoryChunk );

					// Value is updated in case the value changes in the back-end
					billingHistoryTotal = res.billing_history_total ?? 0;
				}
			}

			dispatch( {
				type: BILLING_TRANSACTIONS_RECEIVE,
				past: fullBillingHistory,
				upcoming: upcoming_charges,
			} );
			dispatch( {
				type: BILLING_TRANSACTIONS_REQUEST_SUCCESS,
			} );
		} catch ( error: any ) {
			dispatch( {
				type: BILLING_TRANSACTIONS_REQUEST_FAILURE,
				error,
			} );
		}
	};
};

export const sendBillingReceiptEmail = ( receiptId: number | string ) => {
	return ( dispatch: CalypsoDispatch ) => {
		return wp.req
			.get( `/me/billing-history/receipt/${ receiptId }/email` )
			.then( () => {
				dispatch( successNotice( translate( 'Your receipt was sent by email successfully.' ) ) );
			} )
			.catch( () => {
				dispatch(
					errorNotice(
						translate(
							'There was a problem sending your receipt. Please try again later or contact support.'
						)
					)
				);
			} );
	};
};
