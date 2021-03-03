/**
 * External dependencies
 */
import React, { useCallback } from 'react';
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
import { BillingHistoryContent } from 'calypso/me/purchases/billing-history/main';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import QueryBillingTransaction from 'calypso/components/data/query-billing-transaction';
import getPastBillingTransaction from 'calypso/state/selectors/get-past-billing-transaction';
import {
	ReceiptBody,
	ReceiptPlaceholder,
	ReceiptTitle,
} from 'calypso/me/purchases/billing-history/receipt';
import FormattedHeader from 'calypso/components/formatted-header';
import { getReceiptUrlFor, getBillingHistoryUrlFor } from '../paths';
import titles from 'calypso/me/purchases/titles';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import useRedirectToHistoryPageOnInvalidTransaction from './use-redirect-to-history-page-on-invalid-transaction';
import useRedirectToHistoryPageOnWrongSiteForTransaction from './use-redirect-to-history-page-on-wrong-site-for-transaction';
import PurchasesNavigation from 'calypso/my-sites/purchases/navigation';
import SiteLevelPurchasesErrorBoundary from 'calypso/my-sites/purchases/site-level-purchases-error-boundary';
import { logToLogstash } from 'calypso/state/logstash/actions';
import config from '@automattic/calypso-config';

function useLogBillingHistoryError( message: string ) {
	const reduxDispatch = useDispatch();

	return useCallback(
		( error ) => {
			reduxDispatch(
				logToLogstash( {
					feature: 'calypso_client',
					message,
					severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
					extra: {
						env: config( 'env_id' ),
						type: 'site_level_billing_history',
						message: String( error ),
					},
				} )
			);
		},
		[ reduxDispatch ]
	);
}

export function BillingHistory( { siteSlug }: { siteSlug: string } ) {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const translate = useTranslate();
	const logBillingHistoryError = useLogBillingHistoryError(
		'site level billing history load error'
	);

	const getReceiptUrlForReceiptId = ( targetReceiptId: string | number ) =>
		getReceiptUrlFor( siteSlug, targetReceiptId );

	return (
		<Main className="purchases billing-history is-wide-layout">
			<MySitesSidebarNavigation />
			<DocumentHead title={ titles.billingHistory } />
			<PageViewTracker path="/purchases/billing-history" title="Billing History" />
			<QueryBillingTransactions />
			<FormattedHeader
				brandFont
				className="billing-history__page-heading"
				headerText={ titles.sectionTitle }
				align="left"
			/>
			<PurchasesNavigation sectionTitle={ 'Billing History' } siteSlug={ siteSlug } />

			<SiteLevelPurchasesErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logBillingHistoryError }
			>
				<BillingHistoryContent
					siteId={ selectedSiteId }
					getReceiptUrlFor={ getReceiptUrlForReceiptId }
				/>
			</SiteLevelPurchasesErrorBoundary>
			<CompactCard href="/me/purchases/billing">
				{ translate( 'View all billing history and receipts' ) }
			</CompactCard>
		</Main>
	);
}

export function ReceiptView( {
	siteSlug,
	receiptId,
}: {
	siteSlug: string;
	receiptId: number;
} ): JSX.Element {
	const translate = useTranslate();
	const transaction = useSelector( ( state ) => getPastBillingTransaction( state, receiptId ) );
	const logBillingHistoryError = useLogBillingHistoryError( 'site level receipt view load error' );
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
			<DocumentHead title={ titles.billingHistory } />
			<PageViewTracker
				path="/purchases/billing-history/:site/:receipt"
				title="Billing History > Receipt"
			/>
			<QueryBillingTransaction transactionId={ receiptId } />
			<FormattedHeader
				brandFont
				className="billing-history__page-heading"
				headerText={ titles.sectionTitle }
				align="left"
			/>

			<SiteLevelPurchasesErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logBillingHistoryError }
			>
				<ReceiptTitle backHref={ getBillingHistoryUrlFor( siteSlug ) } />
				{ transaction && isCorrectSite ? (
					<ReceiptBody transaction={ transaction } handlePrintLinkClick={ handlePrintLinkClick } />
				) : (
					<ReceiptPlaceholder />
				) }
			</SiteLevelPurchasesErrorBoundary>
		</Main>
	);
}
