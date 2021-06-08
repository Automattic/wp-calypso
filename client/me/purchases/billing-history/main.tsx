/**
 * External dependencies
 */
import React from 'react';
import { localize, useTranslate } from 'i18n-calypso';
import { CompactCard, Card } from '@automattic/components';
import config from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import { vatDetails as vatDetailsPath, billingHistoryReceipt } from 'calypso/me/purchases/paths';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import PurchasesNavigation from 'calypso/me/purchases/purchases-navigation';
import Main from 'calypso/components/main';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryBillingTransactions from 'calypso/components/data/query-billing-transactions';
import titles from 'calypso/me/purchases/titles';
import FormattedHeader from 'calypso/components/formatted-header';
import BillingHistoryList from 'calypso/me/purchases/billing-history/billing-history-list';
import useVatDetails from 'calypso/me/purchases/vat-info/use-vat-details';

/**
 * Style dependencies
 */
import './style.scss';

export function BillingHistoryContent( {
	siteId = null,
	getReceiptUrlFor = billingHistoryReceipt,
}: {
	siteId: number | null;
	getReceiptUrlFor: ( receiptId: string | number ) => string;
} ): JSX.Element {
	return (
		<Card className="billing-history__receipts">
			<BillingHistoryList header siteId={ siteId } getReceiptUrlFor={ getReceiptUrlFor } />
		</Card>
	);
}

function BillingHistory(): JSX.Element {
	const translate = useTranslate();
	const { vatDetails } = useVatDetails();
	const editVatText = translate( 'Edit VAT details (for Europe only)' );
	const addVatText = translate( 'Add VAT details (for Europe only)' );
	const vatText = vatDetails.id ? editVatText : addVatText;

	return (
		<Main wideLayout className="billing-history">
			<DocumentHead title={ titles.billingHistory } />
			<PageViewTracker path="/me/purchases/billing" title="Me > Billing History" />
			<MeSidebarNavigation />
			<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
			<QueryBillingTransactions />
			<PurchasesNavigation section="billingHistory" />
			<BillingHistoryContent siteId={ null } getReceiptUrlFor={ billingHistoryReceipt } />

			{ config.isEnabled( 'me/vat-details' ) && (
				<CompactCard href={ vatDetailsPath }>{ vatText }</CompactCard>
			) }
		</Main>
	);
}
export default localize( BillingHistory );
