/**
 * External dependencies
 */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import { ReceiptBody, ReceiptPlaceholder, ReceiptTitle } from 'me/billing-history/receipt';
import FormattedHeader from 'components/formatted-header';
import { getReceiptUrlFor, getBillingHistoryUrlFor } from '../paths';
import { recordGoogleEvent } from 'state/analytics/actions';
import useRedirectToHistoryPageOnInvalidTransaction from './use-redirect-to-history-page-on-invalid-transaction';

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

export function ReceiptView( { siteSlug, receiptId }: { siteSlug: string; receiptId: number } ) {
	const translate = useTranslate();
	const transaction = useSelector( ( state ) => getPastBillingTransaction( state, receiptId ) );
	const reduxDispatch = useDispatch();

	useRedirectToHistoryPageOnInvalidTransaction( siteSlug, receiptId );

	const handlePrintLinkClick = () => {
		const action = 'Print Receipt Button in Billing History Receipt';
		reduxDispatch( recordGoogleEvent( 'Me', 'Clicked on ' + action ) );
		window.print();
	};

	return (
		<Main className="purchases billing-history is-wide-layout">
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

			<ReceiptTitle backHref={ getBillingHistoryUrlFor( siteSlug ) } />

			{ transaction ? (
				<ReceiptBody transaction={ transaction } handlePrintLinkClick={ handlePrintLinkClick } />
			) : (
				<ReceiptPlaceholder />
			) }
		</Main>
	);
}
