/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MySitesSidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import Main from 'calypso/components/main';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryBillingTransactions from 'calypso/components/data/query-billing-transactions';
import FormattedHeader from 'calypso/components/formatted-header';
import PurchasesNavigation from 'calypso/my-sites/purchases/navigation';
import CreditCards from 'calypso/me/purchases/credit-cards';

export function PaymentMethods( { siteSlug }: { siteSlug: string } ) {
	const translate = useTranslate();

	return (
		<Main className="purchases payment-methods is-wide-layout">
			<MySitesSidebarNavigation />
			<DocumentHead title={ translate( 'Payment Methods' ) } />
			<PageViewTracker path="/purchases/payment-methods" title="Payment Methods" />
			<QueryBillingTransactions />
			<FormattedHeader
				brandFont
				className="payment-methods__page-heading"
				headerText={ translate( 'Billing' ) }
				align="left"
			/>
			<PurchasesNavigation sectionTitle={ 'Payment Methods' } siteSlug={ siteSlug } />

			<CreditCards />
		</Main>
	);
}
