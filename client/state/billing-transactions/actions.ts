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
	return ( dispatch: CalypsoDispatch ) => {
		dispatch( {
			type: BILLING_TRANSACTIONS_REQUEST,
		} );

		return wp.req
			.get( '/me/billing-history' + ( transactionType ? `/${ transactionType }` : '' ), {
				apiVersion: '1.3',
			} )
			.then(
				( {
					billing_history,
					upcoming_charges,
				}: {
					billing_history: BillingTransaction[];
					upcoming_charges: UpcomingCharge[];
				} ) => {
					dispatch( {
						type: BILLING_TRANSACTIONS_RECEIVE,
						past: billing_history,
						upcoming: upcoming_charges,
					} );
					dispatch( {
						type: BILLING_TRANSACTIONS_REQUEST_SUCCESS,
					} );
				}
			)
			.catch( ( error: Error ) => {
				dispatch( {
					type: BILLING_TRANSACTIONS_REQUEST_FAILURE,
					error,
				} );
			} );
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
