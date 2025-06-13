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

		const limit = 200;
		let url = '/me/billing-history' + ( transactionType ? `/${ transactionType }` : '' );
		if ( transactionType !== 'upcoming' ) {
			url = url + '?limit=' + limit;
		}

		try {
			const {
				billing_history,
				upcoming_charges,
			}: {
				billing_history: BillingTransaction[];
				upcoming_charges: UpcomingCharge[];
			} = await wp.req.get( url, {
				apiVersion: '1.3',
			} );

			const fullBillingHistory = billing_history;
			if ( billing_history.length === limit ) {
				// If we have exactly the limit number of transactions, it means there are more transactions to fetch.
				let nextData = [];
				do {
					// Fetch the next page of transactions.
					const offset_url = url + '&offset=' + billing_history.length;

					const res = await wp.req.get( offset_url, {
						apiVersion: '1.3',
					} );

					fullBillingHistory.push( ...res.billing_history );
					nextData = res.billing_history;
				} while ( nextData.length === limit );
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
