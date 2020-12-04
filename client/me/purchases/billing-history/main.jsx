/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { billingHistoryReceipt } from 'calypso/me/purchases/paths';
import { Card } from '@automattic/components';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import PurchasesNavigation from 'calypso/me/purchases/purchases-navigation';
import BillingHistoryTable from './billing-history-table';
import Main from 'calypso/components/main';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryBillingTransactions from 'calypso/components/data/query-billing-transactions';
import titles from 'calypso/me/purchases/titles';
import FormattedHeader from 'calypso/components/formatted-header';
import BillingHistoryList from 'calypso/me/purchases/billing-history/billing-history-list';

/**
 * Style dependencies
 */
import './style.scss';

export function BillingHistoryContent( {
	siteId = null,
	getReceiptUrlFor = billingHistoryReceipt,
} ) {
	return (
		<Card className="billing-history__receipts">
			<BillingHistoryList header siteId={ siteId } getReceiptUrlFor={ getReceiptUrlFor } />
		</Card>
	);
}

const BillingHistory = ( { translate } ) => (
	<Main className="billing-history is-wide-layout">
		<DocumentHead title={ translate( 'Billing History' ) } />
		<PageViewTracker path="/me/purchases/billing" title="Me > Billing History" />
		<MeSidebarNavigation />

		<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
		<QueryBillingTransactions />
		<PurchasesNavigation section={ 'billing' } />
		<BillingHistoryContent />
	</Main>
);

export default localize( BillingHistory );
