import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchReceipt } from 'calypso/state/receipts/actions';
import { getReceiptById } from 'calypso/state/receipts/selectors';
import FailedPurchaseDetails from './failed-purchase-details';

import './style.scss';

export function FailedPurchasePage() {
	const translate = useTranslate();
	const location = useLocation();
	const dispatch = useDispatch();

	// Get receipt ID from query param: /checkout/failed-purchases?receipt_id=12345
	const params = new URLSearchParams( location.search );
	const receiptId = params.get( 'receipt_id' );
	const receiptIdNum = receiptId ? parseInt( receiptId, 10 ) : null;

	// Fetch receipt from Redux if available
	const receipt = useSelector( ( state ) =>
		receiptIdNum ? getReceiptById( state, receiptIdNum ) : null
	);

	// Fetch receipt if not already loaded
	useEffect( () => {
		if ( receiptIdNum && ! receipt?.data ) {
			dispatch( fetchReceipt( receiptIdNum ) );
		}
	}, [ receiptIdNum, receipt?.data, dispatch ] );

	// Show loading state while fetching
	if ( receiptIdNum && ! receipt?.data && receipt?.isRequesting ) {
		return <Loading />;
	}

	return (
		<div className="failed-purchases-page">
			<PageViewTracker path="/checkout/failed-purchases" title="Failed purchases" />
			<DocumentHead title={ translate( 'Checkout' ) } />
			<FailedPurchaseDetails
				failedPurchases={ receipt?.data?.failedPurchases }
				purchases={ receipt?.data?.purchases }
			/>
		</div>
	);
}
