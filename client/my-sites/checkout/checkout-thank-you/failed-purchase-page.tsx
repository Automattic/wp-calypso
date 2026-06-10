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

	const failedItems = receipt?.failed_purchases
		? Object.values( receipt.failed_purchases ).flat()
		: [];

	// A failed line item still lives in `receipt.items` — the refund is recorded on a
	// separate cancellation receipt, so the original line persists here. Exclude
	// anything that also appears in `failed_purchases` (and any domain connection
	// orphaned by a failed domain) from the "added successfully" list, so a failed
	// item isn't shown as both succeeded and failed.
	const failedItemKeys = new Set(
		failedItems.map( ( item ) => `${ item.product_slug }:${ item.product_meta }` )
	);
	const failedDomains = new Set(
		failedItems.map( ( item ) => item.product_meta ).filter( Boolean )
	);

	const purchases = receipt?.items
		.filter( ( item ) => {
			if ( failedItemKeys.has( `${ item.wpcom_product_slug }:${ item.domain ?? '' }` ) ) {
				return false;
			}
			// `domain_map` is a connection to a domain; if that domain failed to register,
			// the connection is orphaned and shouldn't be listed as a success.
			if (
				item.wpcom_product_slug === 'domain_map' &&
				item.domain &&
				failedDomains.has( item.domain )
			) {
				return false;
			}
			return true;
		} )
		.map( ( item ) => ( {
			productId: item.id,
			productName: item.variation || item.product,
			meta: item.domain ?? '',
		} ) );

	const failedPurchases = receipt?.failed_purchases
		? failedItems.map( ( item ) => ( {
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
