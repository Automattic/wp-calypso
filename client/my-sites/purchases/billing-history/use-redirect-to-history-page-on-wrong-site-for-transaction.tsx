/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getBillingHistoryUrlFor } from '../paths';

export default function useRedirectToHistoryPageOnWrongSiteForTransaction(
	siteSlug: string,
	receiptId: number,
	transaction: Transaction
): boolean {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const reduxDispatch = useDispatch();
	const didRedirect = useRef( false );
	const doesTransactionExist = !! transaction;
	const doesTransactionMatchSite =
		doesTransactionExist &&
		selectedSiteId &&
		transaction.items.some(
			( receiptItem ) => String( receiptItem.site_id ) === String( selectedSiteId )
		);

	useEffect( () => {
		if ( ! doesTransactionExist || ! selectedSiteId ) {
			// We may still be loading the transaction or site id
			return;
		}
		if ( didRedirect.current ) {
			return;
		}
		if ( ! doesTransactionMatchSite ) {
			didRedirect.current = true;
			page.redirect( getBillingHistoryUrlFor( siteSlug ) );
		}
	}, [
		receiptId,
		reduxDispatch,
		siteSlug,
		selectedSiteId,
		doesTransactionExist,
		doesTransactionMatchSite,
	] );

	return !! doesTransactionMatchSite;
}

// Ideally these should be defined elsewhere with all their properties, but
// we'll define what we need here.
interface Transaction {
	items: TransactionItem[];
}
interface TransactionItem {
	site_id: number | null;
}
