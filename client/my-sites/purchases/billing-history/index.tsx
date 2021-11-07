import config from '@automattic/calypso-config';
import { CompactCard } from '@automattic/components';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryBillingTransaction from 'calypso/components/data/query-billing-transaction';
import QueryBillingTransactions from 'calypso/components/data/query-billing-transactions';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { logToLogstash } from 'calypso/lib/logstash';
import { BillingHistoryContent } from 'calypso/me/purchases/billing-history/main';
import {
	ReceiptBody,
	ReceiptPlaceholder,
	ReceiptTitle,
} from 'calypso/me/purchases/billing-history/receipt';
import titles from 'calypso/me/purchases/titles';
import PurchasesNavigation from 'calypso/my-sites/purchases/navigation';
import MySitesSidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import getPastBillingTransaction from 'calypso/state/selectors/get-past-billing-transaction';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getReceiptUrlFor, getBillingHistoryUrlFor } from '../paths';
import useRedirectToHistoryPageOnInvalidTransaction from './use-redirect-to-history-page-on-invalid-transaction';
import useRedirectToHistoryPageOnWrongSiteForTransaction from './use-redirect-to-history-page-on-wrong-site-for-transaction';

import './style.scss';

function useLogBillingHistoryError( message: string ) {
	return useCallback(
		( error ) => {
			logToLogstash( {
				feature: 'calypso_client',
				message,
				severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
				extra: {
					env: config( 'env_id' ),
					type: 'site_level_billing_history',
					message: String( error ),
				},
			} );
		},
		[ message ]
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
		<Main wideLayout className="purchases billing-history">
			<MySitesSidebarNavigation />
			<DocumentHead title={ titles.billingHistory } />
			<PageViewTracker path="/purchases/billing-history" title="Billing History" />
			<QueryBillingTransactions />
			<FormattedHeader
				brandFont
				className="billing-history__page-heading"
				headerText={ titles.sectionTitle }
				subHeaderText={ translate(
					'View, print, and email your receipts for this site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="billing" showIcon={ false } />,
						},
					}
				) }
				align="left"
			/>
			<PurchasesNavigation sectionTitle={ 'Billing History' } siteSlug={ siteSlug } />

			<CheckoutErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logBillingHistoryError }
			>
				<BillingHistoryContent
					siteId={ selectedSiteId }
					getReceiptUrlFor={ getReceiptUrlForReceiptId }
				/>
			</CheckoutErrorBoundary>
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
		<Main wideLayout className="purchases billing-history">
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

			<CheckoutErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logBillingHistoryError }
			>
				<ReceiptTitle backHref={ getBillingHistoryUrlFor( siteSlug ) } />
				{ transaction && isCorrectSite ? (
					<ReceiptBody transaction={ transaction } handlePrintLinkClick={ handlePrintLinkClick } />
				) : (
					<ReceiptPlaceholder />
				) }
			</CheckoutErrorBoundary>
		</Main>
	);
}
