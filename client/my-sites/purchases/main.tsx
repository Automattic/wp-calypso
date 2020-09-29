/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Subscriptions from './subscriptions';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import ManagePurchase from 'me/purchases/manage-purchase';
import CancelPurchase from 'me/purchases/cancel-purchase';

export function Purchases() {
	const translate = useTranslate();

	return (
		<Main className="purchases is-wide-layout">
			<DocumentHead title={ translate( 'Billing' ) } />
			<FormattedHeader
				brandFont
				className="purchases__page-heading"
				headerText={ translate( 'Billing' ) }
				align="left"
			/>

			<Subscriptions />
		</Main>
	);
}

export function PurchaseDetails( {
	purchaseId,
	siteSlug,
}: {
	purchaseId: number;
	siteSlug: string;
} ) {
	const translate = useTranslate();

	const getCancelPurchaseUrlFor = ( targetSiteSlug: string, targetPurchaseId: string | number ) =>
		`/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }/cancel`;

	return (
		<Main className="purchases is-wide-layout">
			<DocumentHead title={ translate( 'Billing' ) } />
			<FormattedHeader
				brandFont
				className="purchases__page-heading"
				headerText={ translate( 'Billing' ) }
				align="left"
			/>

			<ManagePurchase
				cardTitle={ translate( 'Subscription settings' ) }
				purchaseId={ purchaseId }
				siteSlug={ siteSlug }
				showHeader={ false }
				purchaseListUrl={ `/purchases/subscriptions/${ siteSlug }` }
				getCancelPurchaseUrlFor={ getCancelPurchaseUrlFor }
			/>
		</Main>
	);
}

export function PurchaseCancel( {
	purchaseId,
	siteSlug,
}: {
	purchaseId: number;
	siteSlug: string;
} ) {
	const translate = useTranslate();

	const getManagePurchaseUrlFor = ( targetSiteSlug: string, targetPurchaseId: string | number ) =>
		`/purchases/subscriptions/${ targetSiteSlug }/${ targetPurchaseId }`;

	return (
		<Main className="purchases is-wide-layout">
			<DocumentHead title={ translate( 'Cancel purchase' ) } />
			<FormattedHeader
				brandFont
				className="purchases__page-heading"
				headerText={ translate( 'Cancel purchase' ) }
				align="left"
			/>

			<CancelPurchase
				purchaseId={ purchaseId }
				siteSlug={ siteSlug }
				getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
				purchaseListUrl={ `/purchases/subscriptions/${ siteSlug }` }
			/>
		</Main>
	);
}
