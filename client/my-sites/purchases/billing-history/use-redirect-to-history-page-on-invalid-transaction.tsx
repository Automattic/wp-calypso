import page from '@automattic/calypso-router';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'calypso/state';
import { clearBillingTransactionError } from 'calypso/state/billing-transactions/individual-transactions/actions';
import isPastBillingTransactionError from 'calypso/state/selectors/is-past-billing-transaction-error';
import { getBillingHistoryUrlFor } from '../paths';
import type { IAppState } from 'calypso/state/types';

export default function useRedirectToHistoryPageOnInvalidTransaction(
	siteSlug: string,
	receiptId: number
) {
	const transactionFetchError = useSelector( ( state: IAppState ) =>
		isPastBillingTransactionError( state, receiptId )
	);
	const reduxDispatch = useDispatch();
	const didRedirect = useRef( false );

	useEffect( () => {
		if ( didRedirect.current ) {
			return;
		}
		if ( transactionFetchError ) {
			didRedirect.current = true;
			reduxDispatch( clearBillingTransactionError( receiptId ) );
			page.redirect( getBillingHistoryUrlFor( siteSlug ) );
		}
	}, [ transactionFetchError, receiptId, reduxDispatch, siteSlug ] );
}
