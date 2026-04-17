import { receiptQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import FailedPurchaseDetails from './failed-purchase-details';

import './style.scss';

export function FailedPurchasePage() {
	const translate = useTranslate();

	const params = new URLSearchParams( window.location.search );
	const receiptId = params.get( 'receipt_id' );
	const receiptIdNum = receiptId ? parseInt( receiptId, 10 ) : null;

	const { data: receipt, isLoading } = useQuery( {
		...receiptQuery( receiptIdNum ?? 0, { includeFailedPurchases: true } ),
		enabled: !! receiptIdNum,
	} );

	if ( receiptIdNum && isLoading ) {
		return <Loading />;
	}

	const purchases = receipt?.items.map( ( item ) => ( {
		productId: item.id,
		productName: item.product,
		meta: item.variation,
	} ) );

	const failedPurchases = receipt?.failed_purchases
		? Object.values( receipt.failed_purchases )
				.flat()
				.map( ( item ) => ( {
					productId: item.product_id,
					productName: item.product_name,
					productSlug: item.product_slug,
					productCost: item.product_cost,
					meta: item.product_meta,
				} ) )
		: undefined;

	return (
		<div className="failed-purchases-page">
			<PageViewTracker path="/checkout/failed-purchases" title="Failed purchases" />
			<DocumentHead title={ translate( 'Checkout' ) } />
			<FailedPurchaseDetails failedPurchases={ failedPurchases } purchases={ purchases } />
		</div>
	);
}
