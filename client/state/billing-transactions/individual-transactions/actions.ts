import { translate } from 'i18n-calypso';
import wp from 'calypso/lib/wp';
import { billingHistoryReceipt } from 'calypso/me/purchases/paths';
import {
	BILLING_TRANSACTION_ERROR_CLEAR,
	BILLING_TRANSACTION_REQUEST,
	BILLING_TRANSACTION_RECEIVE,
	BILLING_TRANSACTION_REQUEST_FAILURE,
	BILLING_TRANSACTION_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { errorNotice } from 'calypso/state/notices/actions';
import type { IndividualReceipt } from '../types';
import type { CalypsoDispatch } from 'calypso/state/types';

import 'calypso/state/billing-transactions/init';

export const requestBillingTransaction =
	( transactionId: number | string ) => ( dispatch: CalypsoDispatch ) => {
		dispatch( {
			type: BILLING_TRANSACTION_REQUEST,
			transactionId,
		} );

		return wp.req
			.get( `/me/billing-history/receipt/${ transactionId }`, { format: 'display' } )
			.then( ( receipt: IndividualReceipt ) => {
				dispatch( {
					type: BILLING_TRANSACTION_REQUEST_SUCCESS,
					transactionId,
				} );
				dispatch( {
					type: BILLING_TRANSACTION_RECEIVE,
					transactionId,
					receipt: receipt,
				} );
			} )
			.catch( ( error: { error: string } ) => {
				dispatch( {
					type: BILLING_TRANSACTION_REQUEST_FAILURE,
					transactionId,
					error,
				} );

				const displayOnNextPage = true;
				const id = `transaction-fetch-${ transactionId }`;
				if ( 'invalid_receipt' === error.error ) {
					dispatch(
						errorNotice(
							translate( "Sorry, we couldn't find receipt #%s.", { args: transactionId } ),
							{
								id,
								displayOnNextPage,
								duration: 5000,
							}
						)
					);
					return;
				}

				dispatch(
					errorNotice( translate( "Sorry, we weren't able to load the requested receipt." ), {
						id,
						displayOnNextPage,
						button: translate( 'Try again' ),
						href: billingHistoryReceipt( transactionId ),
					} )
				);
			} );
	};

export const clearBillingTransactionError = ( transactionId: number | string ) => ( {
	type: BILLING_TRANSACTION_ERROR_CLEAR,
	transactionId,
} );
