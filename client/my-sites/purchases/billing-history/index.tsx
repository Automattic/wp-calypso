/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MySitesSidebarNavigation from 'my-sites/sidebar-navigation';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryBillingTransactions from 'components/data/query-billing-transactions';
import { BillingHistoryList } from 'me/billing-history/main';
import { getSelectedSiteId } from 'state/ui/selectors';
import { CompactCard } from '@automattic/components';
import QueryBillingTransaction from 'components/data/query-billing-transaction';
import getPastBillingTransaction from 'state/selectors/get-past-billing-transaction';
import { ReceiptBody, ReceiptPlaceholder } from 'me/billing-history/receipt';
import FormattedHeader from 'components/formatted-header';
import { getReceiptUrlFor } from '../paths';

export function BillingHistory( { siteSlug }: { siteSlug: string } ) {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const translate = useTranslate();

	const getReceiptUrlForReceiptId = ( targetReceiptId: string | number ) =>
		getReceiptUrlFor( siteSlug, targetReceiptId );

	return (
		<Main className="purchases billing-history is-wide-layout">
			<MySitesSidebarNavigation />
			<DocumentHead title={ translate( 'Billing History' ) } />
			<PageViewTracker path="/purchases/billing-history" title="Billing History" />
			<QueryBillingTransactions />
			<FormattedHeader
				brandFont
				className="billing-history__page-heading"
				headerText={ translate( 'Billing' ) }
				align="left"
			/>
			<BillingHistoryList
				siteId={ selectedSiteId }
				getReceiptUrlFor={ getReceiptUrlForReceiptId }
			/>
			<CompactCard href="/me/purchases/billing">
				{ translate( 'View all billing history and receipts' ) }
			</CompactCard>
		</Main>
	);
}

export function ReceiptView( { receiptId }: { receiptId: number } ) {
	const translate = useTranslate();
	const transaction = useSelector( ( state ) => getPastBillingTransaction( state, receiptId ) );
	// TODO: handle error redirects
	// const transactionFetchError = useSelector( ( state ) =>
	// 	isPastBillingTransactionError( state, receiptId )
	// );

	// TODO: handle clicks
	const handlePrintLinkClick = () => {
		window.print();
	};

	// TODO: add back button in header

	return (
		<Main className="purchases billing-history">
			<DocumentHead title={ translate( 'Billing History' ) } />
			<PageViewTracker
				path="/purchases/billing-history/:site/:receipt"
				title="Billing History > Receipt"
			/>
			<QueryBillingTransaction transactionId={ receiptId } />

			<FormattedHeader
				brandFont
				className="billing-history__page-heading"
				headerText={ translate( 'Billing' ) }
				align="left"
			/>

			{ transaction ? (
				<ReceiptBody transaction={ transaction } handlePrintLinkClick={ handlePrintLinkClick } />
			) : (
				<ReceiptPlaceholder />
			) }
		</Main>
	);
}
