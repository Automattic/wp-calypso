import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { CompactCard } from '@automattic/components';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import JetpackRnaActionCard from 'calypso/components/jetpack/card/jetpack-rna-action-card';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { Purchase } from 'calypso/lib/purchases/types';
import PurchasesListHeader from 'calypso/me/purchases/purchases-list/purchases-list-header';
import { PurchasesDataViews } from 'calypso/me/purchases/purchases-list-in-dataviews/purchases-data-view';
import PurchasesSite from 'calypso/me/purchases/purchases-site';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import { useSelector } from 'calypso/state';
import { hasJetpackPartnerAccess as hasJetpackPartnerAccessSelector } from 'calypso/state/partner-portal/partner/selectors';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { SiteDetails } from '@automattic/data-stores';
import type { GetManagePurchaseUrlFor } from 'calypso/lib/purchases/types';

import './style.scss';

function SubscriptionsContent( {
	isFetchingPurchases,
	hasLoadedPurchases,
	selectedSiteId,
	selectedSite,
	purchases,
}: {
	isFetchingPurchases: boolean;
	hasLoadedPurchases: boolean;
	selectedSiteId: number | null;
	selectedSite: undefined | null | SiteDetails;
	purchases: Purchase[];
} ) {
	const getManagePurchaseUrlFor: GetManagePurchaseUrlFor = ( siteSlug, purchaseId ) =>
		`/purchases/subscriptions/${ siteSlug }/${ purchaseId }`;
	const { paymentMethods: cards } = useStoredPaymentMethods( { type: 'card' } );

	// If there is no selected site, show the "no sites" page
	if ( ! selectedSiteId ) {
		return <NoSitesMessage />;
	}

	// If there is a selected site but no site data, show the placeholder
	if ( ! selectedSite?.ID ) {
		return (
			<div className="subscriptions__list">
				<PurchasesSite isPlaceholder />
			</div>
		);
	}

	// If there are purchases, show them
	if ( purchases.length ) {
		return (
			<div className="subscriptions__list">
				<PurchasesListHeader />

				<PurchasesSite
					getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
					key={ selectedSite.ID }
					siteId={ selectedSite.ID }
					slug={ selectedSite.slug }
					purchases={ purchases }
					cards={ cards }
				/>
			</div>
		);
	}

	// If we are loading purchases, show the placeholder
	if ( ! hasLoadedPurchases || isFetchingPurchases ) {
		return (
			<div className="subscriptions__list">
				<PurchasesSite isPlaceholder />
			</div>
		);
	}

	// If there is selected site data but no purchases, show the "no purchases" page
	return <NoPurchasesMessage />;
}

export default function SubscriptionsContentWrapper() {
	const isFetchingPurchases = useSelector( isFetchingSitePurchases );
	const hasLoadedPurchases = useSelector( hasLoadedSitePurchasesFromServer );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSite = useSelector( getSelectedSite );
	const purchases = useSelector( ( state ) =>
		isFetchingPurchases || ! hasLoadedPurchases ? [] : getSitePurchases( state, selectedSiteId )
	);
	const sites = useSelector( getSites ).filter( isValueTruthy );

	if ( config.isEnabled( 'purchases/purchase-list-dataview' ) ) {
		if ( ! selectedSiteId ) {
			return <NoSitesMessage />;
		}
		if ( ! hasLoadedPurchases || isFetchingPurchases ) {
			return (
				<div className="subscriptions__list">
					<PurchasesSite isPlaceholder />
				</div>
			);
		}
		// If there is a selected site but no site data, show the placeholder
		if ( ! selectedSite?.ID ) {
			return (
				<div className="subscriptions__list">
					<PurchasesSite isPlaceholder />
				</div>
			);
		}
		if ( purchases.length < 1 ) {
			return <NoPurchasesMessage />;
		}
		return <PurchasesDataViews purchases={ purchases } sites={ sites } />;
	}

	return (
		<SubscriptionsContent
			isFetchingPurchases={ isFetchingPurchases }
			hasLoadedPurchases={ hasLoadedPurchases }
			selectedSiteId={ selectedSiteId }
			selectedSite={ selectedSite }
			purchases={ purchases }
		/>
	);
}

function NoPurchasesMessage() {
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const translate = useTranslate();
	const hasJetpackPartnerAccess = useSelector( hasJetpackPartnerAccessSelector );
	const commonEventProps = { context: 'site' };

	let url;
	if ( ! isJetpackCloud() ) {
		url = selectedSite ? `/plans/${ selectedSite.slug }` : '/plans';
	} else if ( hasJetpackPartnerAccess ) {
		url = selectedSiteId
			? `/partner-portal/issue-license?site_id=${ selectedSiteId }`
			: '/partner-portal/issue-license';
	} else {
		url = selectedSite ? `/pricing/${ selectedSite.slug }` : '/pricing';
	}

	return isJetpackCloud() ? (
		<JetpackRnaActionCard
			headerText={ translate( 'You don’t have any active subscriptions for this site.' ) }
			subHeaderText={ translate(
				'Check out how Jetpack’s security, performance, and growth tools can improve your site.'
			) }
			ctaButtonLabel={ translate( 'View products' ) }
			ctaButtonURL={ url }
		/>
	) : (
		<CompactCard className="subscriptions__list">
			<>
				<TrackComponentView
					eventName="calypso_no_purchases_upgrade_nudge_impression"
					eventProperties={ commonEventProps }
				/>
				<EmptyContent
					title={ translate( 'Looking to upgrade?' ) }
					line={ translate( 'You have made no purchases for this site.' ) }
					action={ translate( 'Upgrade now' ) }
					actionURL={ url }
					actionCallback={ () => {
						recordTracksEvent( 'calypso_no_purchases_upgrade_nudge_click', commonEventProps );
					} }
				/>
			</>
		</CompactCard>
	);
}
