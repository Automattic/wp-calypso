/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addCreditCard, billingHistoryReceipt } from 'calypso/me/purchases/paths';
import { Card } from '@automattic/components';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import config from 'calypso/config';
import CreditCards from 'calypso/me/purchases/credit-cards';
import PurchasesHeader from '../purchases/purchases-list/header';
import BillingHistoryTable from './billing-history-table';
import Main from 'calypso/components/main';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryBillingTransactions from 'calypso/components/data/query-billing-transactions';

/**
 * Style dependencies
 */
import './style.scss';

export function BillingHistoryList( { siteId = null, getReceiptUrlFor = billingHistoryReceipt } ) {
	return (
		<Card className="billing-history__receipts">
			<BillingHistoryTable siteId={ siteId } getReceiptUrlFor={ getReceiptUrlFor } />
		</Card>
	);
}

const BillingHistory = ( { translate } ) => (
	<Main className="billing-history">
		<DocumentHead title={ translate( 'Billing History' ) } />
		<PageViewTracker path="/me/purchases/billing" title="Me > Billing History" />
		<MeSidebarNavigation />
		<QueryBillingTransactions />
		<PurchasesHeader section={ 'billing' } />
		<BillingHistoryList />
		{ config.isEnabled( 'upgrades/credit-cards' ) && (
			<CreditCards addPaymentMethodUrl={ addCreditCard } />
		) }
	</Main>
);

export default localize( BillingHistory );
