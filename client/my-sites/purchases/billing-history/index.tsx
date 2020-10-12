/**
 * External dependencies
 */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { CompactCard } from '@automattic/components';

/**
 * Internal dependencies
 */
import MySitesSidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import Main from 'calypso/components/main';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryBillingTransactions from 'calypso/components/data/query-billing-transactions';
import { BillingHistoryList } from 'calypso/me/billing-history/main';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import QueryBillingTransaction from 'calypso/components/data/query-billing-transaction';
import getPastBillingTransaction from 'calypso/state/selectors/get-past-billing-transaction';
import { ReceiptBody, ReceiptPlaceholder, ReceiptTitle } from 'calypso/me/billing-history/receipt';
import FormattedHeader from 'calypso/components/formatted-header';
import { getReceiptUrlFor, getBillingHistoryUrlFor } from '../paths';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import useRedirectToHistoryPageOnInvalidTransaction from './use-redirect-to-history-page-on-invalid-transaction';
import useRedirectToHistoryPageOnWrongSiteForTransaction from './use-redirect-to-history-page-on-wrong-site-for-transaction';
import PurchasesNavigation from 'calypso/my-sites/purchases/navigation';

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
			<PurchasesNavigation sectionTitle={ 'Billing History' } siteSlug={ siteSlug } />

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
	const isCorrectSite = useRedirectToHistoryPageOnWrongSiteForTransaction(
		siteSlug,
		receiptId,
		transaction
	);

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
			{ transaction && isCorrectSite ? (
				<ReceiptBody transaction={ transaction } handlePrintLinkClick={ handlePrintLinkClick } />
			) : (
				<ReceiptPlaceholder />
			) }
		</Main>
	);
}
