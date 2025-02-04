import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import FailedPurchaseDetails from './failed-purchase-details';

import './style.scss';

export function FailedPurchasePage() {
	const translate = useTranslate();
	return (
		<div className="failed-purchases-page">
			<PageViewTracker path="/checkout/failed-purchases" title="Failed purchases" />
			<DocumentHead title={ translate( 'Checkout' ) } />
			<FailedPurchaseDetails />
		</div>
	);
}
