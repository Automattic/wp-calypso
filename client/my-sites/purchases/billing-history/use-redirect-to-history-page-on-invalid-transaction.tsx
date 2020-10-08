/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { getBillingHistoryUrlFor } from '../paths';
import isPastBillingTransactionError from 'calypso/state/selectors/is-past-billing-transaction-error';
import { clearBillingTransactionError } from 'calypso/state/billing-transactions/individual-transactions/actions';

export default function useRedirectToHistoryPageOnInvalidTransaction(
	siteSlug: string,
	receiptId: number
) {
	const transactionFetchError = useSelector( ( state ) =>
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
