import page from '@automattic/calypso-router';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getBillingHistoryUrlFor } from '../paths';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

export default function useRedirectToHistoryPageOnWrongSiteForTransaction(
	siteSlug: string,
	receiptId: number,
	transaction: BillingTransaction | undefined | null
): boolean {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const reduxDispatch = useDispatch();
	const didRedirect = useRef( false );
	const doesTransactionExist = !! transaction;
	const doesTransactionMatchSite =
		doesTransactionExist &&
		selectedSiteId &&
		'items' in transaction &&
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
