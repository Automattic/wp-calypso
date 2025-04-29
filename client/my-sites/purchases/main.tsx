import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryConciergeInitial from 'calypso/components/data/query-concierge-initial/index';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import CancelPurchase from 'calypso/me/purchases/cancel-purchase';
import ConfirmCancelDomain from 'calypso/me/purchases/confirm-cancel-domain';
import { Downgrade } from 'calypso/me/purchases/downgrade';
import ManagePurchase from 'calypso/me/purchases/manage-purchase';
import ChangePaymentMethod from 'calypso/me/purchases/manage-purchase/change-payment-method';
import { PurchaseListConciergeBanner } from 'calypso/me/purchases/purchases-list/purchase-list-concierge-banner';
import titles from 'calypso/me/purchases/titles';
import PurchasesNavigation from 'calypso/my-sites/purchases/navigation';
import { useSelector } from 'calypso/state';
import getAvailableConciergeSessions from 'calypso/state/selectors/get-available-concierge-sessions';
import getConciergeNextAppointment from 'calypso/state/selectors/get-concierge-next-appointment';
import getConciergeUserBlocked from 'calypso/state/selectors/get-concierge-user-blocked';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { logStashLoadErrorEvent } from '../checkout/src/lib/analytics';
import {
	getPurchaseListUrlFor,
	getCancelPurchaseUrlFor,
	getDowngradeUrlFor,
	getConfirmCancelDomainUrlFor,
	getManagePurchaseUrlFor,
	getAddNewPaymentMethodUrlFor,
} from './paths';
import Subscriptions from './subscriptions';
import { getChangeOrAddPaymentMethodUrlFor } from './utils';

import './styles.scss';

function useLogPurchasesError( message: string ) {
	return useCallback(
		( error: Error ) => {
			logStashLoadErrorEvent( 'site_level_purchases', error, { message } );
		},
		[ message ]
	);
}

export function Purchases() {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const logPurchasesError = useLogPurchasesError( 'site level purchases load error' );
	const nextConciergeAppointment = useSelector( getConciergeNextAppointment );
	const isConciergeUserBlocked = useSelector( getConciergeUserBlocked );
	const availableConciergeSessions = useSelector( getAvailableConciergeSessions );
	const siteId = useSelector( getSelectedSiteId );

	return (
		<Main wideLayout className="purchases">
			<QueryConciergeInitial />
			{ isJetpackCloud() && <SidebarNavigation /> }
			<DocumentHead title={ titles.sectionTitle } />
			{ ! isJetpackCloud() && (
				<NavigationHeader
					navigationItems={ [] }
					title={ titles.sectionTitle }
					subtitle={ translate(
						'Manage your site’s plan and upgrades. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: <InlineSupportLink supportContext="purchases" showIcon={ false } />,
							},
						}
					) }
				/>
			) }
			<PurchasesNavigation
				section={ isJetpackCloud() ? 'myPlan' : 'activeUpgrades' }
				siteSlug={ siteSlug }
			/>
			<PurchaseListConciergeBanner
				availableSessions={ availableConciergeSessions }
				isUserBlocked={ isConciergeUserBlocked }
				nextAppointment={ nextConciergeAppointment ?? undefined }
				siteId={ siteId ?? undefined }
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
} ) {
	const translate = useTranslate();
	const logPurchasesError = useLogPurchasesError( 'site level purchase details load error' );
	const redirectTo = getManagePurchaseUrlFor( siteSlug, purchaseId );

	return (
		<Main wideLayout className="purchases manage-purchase">
			<DocumentHead title={ titles.managePurchase } />
			{ ! isJetpackCloud() && (
				<NavigationHeader navigationItems={ [] } title={ titles.sectionTitle } />
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
					isSiteLevel
					siteSlug={ siteSlug }
					showHeader={ false }
					purchaseListUrl={ getPurchaseListUrlFor( siteSlug ) }
					redirectTo={ isJetpackCloud() ? `https://cloud.jetpack.com${ redirectTo }` : redirectTo }
					getCancelPurchaseUrlFor={ getCancelPurchaseUrlFor }
					getDowngradeUrlFor={ getDowngradeUrlFor }
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
} ) {
	const translate = useTranslate();
	const logPurchasesError = useLogPurchasesError( 'site level purchase cancel load error' );

	return (
		<Main wideLayout className="purchases">
			<DocumentHead title={ titles.cancelPurchase } />
			{ ! isJetpackCloud() && (
				<NavigationHeader navigationItems={ [] } title={ titles.sectionTitle } />
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

export function PurchaseDowngrade( {
	purchaseId,
	siteSlug,
}: {
	purchaseId: number;
	siteSlug: string;
} ) {
	const translate = useTranslate();
	const logPurchasesError = useLogPurchasesError( 'site level purchase cancel load error' );

	return (
		<Main wideLayout className="purchases">
			<DocumentHead title={ titles.downgradeSubscription() } />
			{ ! isJetpackCloud() && (
				<NavigationHeader navigationItems={ [] } title={ titles.sectionTitle } />
			) }

			<CheckoutErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPurchasesError }
			>
				<Downgrade
					purchaseId={ purchaseId }
					siteSlug={ siteSlug }
					getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
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
} ) {
	const translate = useTranslate();
	const logPurchasesError = useLogPurchasesError(
		'site level purchase edit payment method load error'
	);

	return (
		<Main wideLayout className="purchases">
			<DocumentHead title={ titles.changePaymentMethod } />
			{ ! isJetpackCloud() && (
				<NavigationHeader navigationItems={ [] } title={ titles.sectionTitle } />
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
} ) {
	const translate = useTranslate();
	const logPurchasesError = useLogPurchasesError( 'site level purchase cancel domain load error' );

	return (
		<Main wideLayout className="purchases">
			<DocumentHead title={ titles.confirmCancelDomain } />
			{ ! isJetpackCloud() && (
				<NavigationHeader navigationItems={ [] } title={ titles.sectionTitle } />
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
