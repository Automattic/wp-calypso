import config from '@automattic/calypso-config';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { logToLogstash } from 'calypso/lib/logstash';
import CancelPurchase from 'calypso/me/purchases/cancel-purchase';
import ConfirmCancelDomain from 'calypso/me/purchases/confirm-cancel-domain';
import ManagePurchase from 'calypso/me/purchases/manage-purchase';
import ChangePaymentMethod from 'calypso/me/purchases/manage-purchase/change-payment-method';
import titles from 'calypso/me/purchases/titles';
import PurchasesNavigation from 'calypso/my-sites/purchases/navigation';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	getPurchaseListUrlFor,
	getCancelPurchaseUrlFor,
	getConfirmCancelDomainUrlFor,
	getManagePurchaseUrlFor,
	getAddNewPaymentMethodUrlFor,
} from './paths';
import Subscriptions from './subscriptions';
import { getChangeOrAddPaymentMethodUrlFor } from './utils';

function useLogPurchasesError( message: string ) {
	return useCallback(
		( error ) => {
			logToLogstash( {
				feature: 'calypso_client',
				message,
				severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
				extra: {
					env: config( 'env_id' ),
					type: 'site_level_purchases',
					message: String( error ),
				},
			} );
		},
		[ message ]
	);
}

export function Purchases(): JSX.Element {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const logPurchasesError = useLogPurchasesError( 'site level purchases load error' );

	return (
		<Main wideLayout className="purchases">
			{ isJetpackCloud() && <SidebarNavigation /> }
			<DocumentHead title={ titles.sectionTitle } />
			{ ! isJetpackCloud() && (
				<FormattedHeader
					brandFont
					className="purchases__page-heading"
					headerText={ titles.sectionTitle }
					subHeaderText={ translate(
						'View, manage, or cancel your plan and other purchases for this site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: <InlineSupportLink supportContext="purchases" showIcon={ false } />,
							},
						}
					) }
					align="left"
				/>
			) }
			<PurchasesNavigation
				sectionTitle={ isJetpackCloud() ? 'Purchases' : 'Active Upgrades' }
				siteSlug={ siteSlug }
			/>

			<CheckoutErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPurchasesError }
			>
				<Subscriptions />
			</CheckoutErrorBoundary>
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
	const redirectTo = getManagePurchaseUrlFor( siteSlug, purchaseId );

	return (
		<Main wideLayout className="purchases manage-purchase">
			<DocumentHead title={ titles.managePurchase } />
			{ ! isJetpackCloud() && (
				<FormattedHeader
					brandFont
					className="purchases__page-heading"
					headerText={ titles.sectionTitle }
					align="left"
				/>
			) }
			<PageViewTracker
				path="/purchases/subscriptions/:site/:purchaseId"
				title="Purchases > Manage Purchase"
			/>

			<CheckoutErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPurchasesError }
			>
				<ManagePurchase
					cardTitle={ titles.managePurchase }
					purchaseId={ purchaseId }
					siteSlug={ siteSlug }
					showHeader={ false }
					purchaseListUrl={ getPurchaseListUrlFor( siteSlug ) }
					redirectTo={ isJetpackCloud() ? `https://cloud.jetpack.com${ redirectTo }` : redirectTo }
					getCancelPurchaseUrlFor={ getCancelPurchaseUrlFor }
					getAddNewPaymentMethodUrlFor={ getAddNewPaymentMethodUrlFor }
					getChangePaymentMethodUrlFor={ getChangeOrAddPaymentMethodUrlFor }
					getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
				/>
			</CheckoutErrorBoundary>
		</Main>
	);
}

export function PurchaseCancel( {
	purchaseId,
	siteSlug,
}: {
	purchaseId: number;
	siteSlug: string;
} ): JSX.Element {
	const translate = useTranslate();
	const logPurchasesError = useLogPurchasesError( 'site level purchase cancel load error' );

	return (
		<Main wideLayout className="purchases">
			<DocumentHead title={ titles.cancelPurchase } />
			{ ! isJetpackCloud() && (
				<FormattedHeader
					brandFont
					className="purchases__page-heading"
					headerText={ titles.sectionTitle }
					align="left"
				/>
			) }

			<CheckoutErrorBoundary
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
			</CheckoutErrorBoundary>
		</Main>
	);
}

export function PurchaseChangePaymentMethod( {
	purchaseId,
	siteSlug,
}: {
	purchaseId: number;
	siteSlug: string;
} ): JSX.Element {
	const translate = useTranslate();
	const logPurchasesError = useLogPurchasesError(
		'site level purchase edit payment method load error'
	);

	return (
		<Main wideLayout className="purchases">
			<DocumentHead title={ titles.changePaymentMethod } />
			{ ! isJetpackCloud() && (
				<FormattedHeader
					brandFont
					className="purchases__page-heading"
					headerText={ titles.sectionTitle }
					align="left"
				/>
			) }

			<CheckoutErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPurchasesError }
			>
				<ChangePaymentMethod
					purchaseId={ purchaseId }
					siteSlug={ siteSlug }
					getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
					purchaseListUrl={ getPurchaseListUrlFor( siteSlug ) }
				/>
			</CheckoutErrorBoundary>
		</Main>
	);
}

export function PurchaseCancelDomain( {
	purchaseId,
	siteSlug,
}: {
	purchaseId: number;
	siteSlug: string;
} ): JSX.Element {
	const translate = useTranslate();
	const logPurchasesError = useLogPurchasesError( 'site level purchase cancel domain load error' );

	return (
		<Main wideLayout className="purchases">
			<DocumentHead title={ titles.confirmCancelDomain } />
			{ ! isJetpackCloud() && (
				<FormattedHeader
					brandFont
					className="purchases__page-heading"
					headerText={ titles.sectionTitle }
					align="left"
				/>
			) }

			<CheckoutErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPurchasesError }
			>
				<ConfirmCancelDomain
					purchaseId={ purchaseId }
					siteSlug={ siteSlug }
					getCancelPurchaseUrlFor={ getCancelPurchaseUrlFor }
					purchaseListUrl={ getPurchaseListUrlFor( siteSlug ) }
				/>
			</CheckoutErrorBoundary>
		</Main>
	);
}
