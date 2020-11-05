/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import Subscriptions from './subscriptions';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import ManagePurchase from 'calypso/me/purchases/manage-purchase';
import CancelPurchase from 'calypso/me/purchases/cancel-purchase';
import ConfirmCancelDomain from 'calypso/me/purchases/confirm-cancel-domain';
import MySitesSidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import {
	getPurchaseListUrlFor,
	getCancelPurchaseUrlFor,
	getConfirmCancelDomainUrlFor,
	getManagePurchaseUrlFor,
	getAddPaymentMethodUrlFor,
} from './paths';
import { getEditOrAddPaymentMethodUrlFor } from './utils';
import AddCardDetails from 'calypso/me/purchases/payment/add-card-details';
import EditCardDetails from 'calypso/me/purchases/payment/edit-card-details';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import PurchasesNavigation from 'calypso/my-sites/purchases/navigation';
import SiteLevelPurchasesErrorBoundary from 'calypso/my-sites/purchases/site-level-purchases-error-boundary';
import { logToLogstash } from 'calypso/state/logstash/actions';
import config from 'calypso/config';

function useLogPurchasesError( message: string ) {
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
						type: 'site_level_purchases',
						message: String( error ),
					},
				} )
			);
		},
		[ reduxDispatch ]
	);
}

export function Purchases() {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const logPurchasesError = useLogPurchasesError( 'site level purchases load error' );

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
			<PurchasesNavigation sectionTitle={ 'Purchases' } siteSlug={ siteSlug } />

			<SiteLevelPurchasesErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPurchasesError }
			>
				<Subscriptions />
			</SiteLevelPurchasesErrorBoundary>
		</Main>
	);
}

export function PurchaseDetails( {
	purchaseId,
	siteSlug,
}: {
	purchaseId: number;
	siteSlug: string;
} ): JSX.Element {
	const translate = useTranslate();
	const logPurchasesError = useLogPurchasesError( 'site level purchase details load error' );

	return (
		<Main className="purchases is-wide-layout">
			<DocumentHead title={ translate( 'Billing' ) } />
			<FormattedHeader
				brandFont
				className="purchases__page-heading"
				headerText={ translate( 'Billing' ) }
				align="left"
			/>
			<PageViewTracker
				path="/purchases/subscriptions/:site/:purchaseId"
				title="Purchases > Manage Purchase"
			/>

			<SiteLevelPurchasesErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPurchasesError }
			>
				<ManagePurchase
					cardTitle={ translate( 'Purchase Settings' ) }
					purchaseId={ purchaseId }
					siteSlug={ siteSlug }
					showHeader={ false }
					purchaseListUrl={ getPurchaseListUrlFor( siteSlug ) }
					getCancelPurchaseUrlFor={ getCancelPurchaseUrlFor }
					getAddPaymentMethodUrlFor={ getAddPaymentMethodUrlFor }
					getEditPaymentMethodUrlFor={ getEditOrAddPaymentMethodUrlFor }
					getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
				/>
			</SiteLevelPurchasesErrorBoundary>
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
	const logPurchasesError = useLogPurchasesError( 'site level purchase cancel load error' );

	return (
		<Main className="purchases is-wide-layout">
			<DocumentHead title={ translate( 'Cancel purchase' ) } />
			<FormattedHeader
				brandFont
				className="purchases__page-heading"
				headerText={ translate( 'Billing' ) }
				align="left"
			/>

			<SiteLevelPurchasesErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPurchasesError }
			>
				<CancelPurchase
					purchaseId={ purchaseId }
					siteSlug={ siteSlug }
					getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
					getConfirmCancelDomainUrlFor={ getConfirmCancelDomainUrlFor }
					purchaseListUrl={ getPurchaseListUrlFor( siteSlug ) }
				/>
			</SiteLevelPurchasesErrorBoundary>
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
	const logPurchasesError = useLogPurchasesError(
		'site level purchase add payment method load error'
	);

	return (
		<Main className="purchases is-wide-layout">
			<DocumentHead title={ translate( 'Billing' ) } />
			<FormattedHeader
				brandFont
				className="purchases__page-heading"
				headerText={ translate( 'Billing' ) }
				align="left"
			/>

			<SiteLevelPurchasesErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPurchasesError }
			>
				<AddCardDetails
					purchaseId={ purchaseId }
					siteSlug={ siteSlug }
					getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
					purchaseListUrl={ getPurchaseListUrlFor( siteSlug ) }
					isFullWidth={ true }
				/>
			</SiteLevelPurchasesErrorBoundary>
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
	const logPurchasesError = useLogPurchasesError(
		'site level purchase edit payment method load error'
	);

	return (
		<Main className="purchases is-wide-layout">
			<DocumentHead title={ translate( 'Billing' ) } />
			<FormattedHeader
				brandFont
				className="purchases__page-heading"
				headerText={ translate( 'Billing' ) }
				align="left"
			/>

			<SiteLevelPurchasesErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPurchasesError }
			>
				<EditCardDetails
					cardId={ cardId }
					purchaseId={ purchaseId }
					siteSlug={ siteSlug }
					getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
					purchaseListUrl={ getPurchaseListUrlFor( siteSlug ) }
					isFullWidth={ true }
				/>
			</SiteLevelPurchasesErrorBoundary>
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
	const logPurchasesError = useLogPurchasesError( 'site level purchase cancel domain load error' );

	return (
		<Main className="purchases is-wide-layout">
			<DocumentHead title={ translate( 'Cancel domain' ) } />
			<FormattedHeader
				brandFont
				className="purchases__page-heading"
				headerText={ translate( 'Billing' ) }
				align="left"
			/>

			<SiteLevelPurchasesErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPurchasesError }
			>
				<ConfirmCancelDomain
					purchaseId={ purchaseId }
					siteSlug={ siteSlug }
					getCancelPurchaseUrlFor={ getCancelPurchaseUrlFor }
					purchaseListUrl={ getPurchaseListUrlFor( siteSlug ) }
				/>
			</SiteLevelPurchasesErrorBoundary>
		</Main>
	);
}
