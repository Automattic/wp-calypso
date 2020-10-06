/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Subscriptions from './subscriptions';
import { BillingHistoryList } from 'me/billing-history/main';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import ManagePurchase from 'me/purchases/manage-purchase';
import CancelPurchase from 'me/purchases/cancel-purchase';
import ConfirmCancelDomain from 'me/purchases/confirm-cancel-domain';
import MySitesSidebarNavigation from 'my-sites/sidebar-navigation';
import {
	getPurchaseListUrlFor,
	getCancelPurchaseUrlFor,
	getConfirmCancelDomainUrlFor,
	getManagePurchaseUrlFor,
	getAddPaymentMethodUrlFor,
} from './paths';
import { getEditPaymentMethodUrlFor } from './utils';
import AddCardDetails from 'me/purchases/payment/add-card-details';
import EditCardDetails from 'me/purchases/payment/edit-card-details';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryBillingTransactions from 'components/data/query-billing-transactions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { CompactCard } from '@automattic/components';

export function Purchases() {
	const translate = useTranslate();

	return (
		<Main className="purchases is-wide-layout">
			<MySitesSidebarNavigation />
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
				purchaseListUrl={ getPurchaseListUrlFor( siteSlug ) }
				getCancelPurchaseUrlFor={ getCancelPurchaseUrlFor }
				getAddPaymentMethodUrlFor={ getAddPaymentMethodUrlFor }
				getEditPaymentMethodUrlFor={ getEditPaymentMethodUrlFor }
				getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
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
				getConfirmCancelDomainUrlFor={ getConfirmCancelDomainUrlFor }
				purchaseListUrl={ getPurchaseListUrlFor( siteSlug ) }
			/>
		</Main>
	);
}

export function PurchaseAddPaymentMethod( {
	purchaseId,
	siteSlug,
}: {
	purchaseId: number;
	siteSlug: string;
} ) {
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

			<AddCardDetails
				purchaseId={ purchaseId }
				siteSlug={ siteSlug }
				getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
				purchaseListUrl={ getPurchaseListUrlFor( siteSlug ) }
				isFullWidth={ true }
			/>
		</Main>
	);
}

export function PurchaseEditPaymentMethod( {
	purchaseId,
	siteSlug,
	cardId,
}: {
	purchaseId: number;
	siteSlug: string;
	cardId: string;
} ) {
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

			<EditCardDetails
				cardId={ cardId }
				purchaseId={ purchaseId }
				siteSlug={ siteSlug }
				getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
				purchaseListUrl={ getPurchaseListUrlFor( siteSlug ) }
				isFullWidth={ true }
			/>
		</Main>
	);
}

export function PurchaseCancelDomain( {
	purchaseId,
	siteSlug,
}: {
	purchaseId: number;
	siteSlug: string;
} ) {
	const translate = useTranslate();

	return (
		<Main className="purchases is-wide-layout">
			<DocumentHead title={ translate( 'Cancel domain' ) } />
			<FormattedHeader
				brandFont
				className="purchases__page-heading"
				headerText={ translate( 'Cancel domain' ) }
				align="left"
			/>

			<ConfirmCancelDomain
				purchaseId={ purchaseId }
				siteSlug={ siteSlug }
				getCancelPurchaseUrlFor={ getCancelPurchaseUrlFor }
				purchaseListUrl={ getPurchaseListUrlFor( siteSlug ) }
			/>
		</Main>
	);
}

export function BillingHistory() {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const translate = useTranslate();

	return (
		<Main className="purchases billing-history">
			<MySitesSidebarNavigation />
			<DocumentHead title={ translate( 'Billing History' ) } />
			<PageViewTracker path="/purchases/billing-history" title="Billing History" />
			<QueryBillingTransactions />
			<FormattedHeader
				brandFont
				className="purchases__page-heading"
				headerText={ translate( 'Billing' ) }
				align="left"
			/>
			<BillingHistoryList siteId={ selectedSiteId } />
			<CompactCard href="/me/purchases/billing">
				{ translate( 'View all billing history and receipts' ) }
			</CompactCard>
		</Main>
	);
}
