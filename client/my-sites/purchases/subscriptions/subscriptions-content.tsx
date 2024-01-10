import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import noSitesIllustration from 'calypso/assets/images/illustrations/illustration-nosites.svg';
import EmptyContent from 'calypso/components/empty-content';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import JetpackRnaActionCard from 'calypso/components/jetpack/card/jetpack-rna-action-card';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { Purchase } from 'calypso/lib/purchases/types';
import PurchasesListHeader from 'calypso/me/purchases/purchases-list/purchases-list-header';
import PurchasesSite from 'calypso/me/purchases/purchases-site';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import { useSelector } from 'calypso/state';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { SiteDetails } from '@automattic/data-stores';

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
	const getManagePurchaseUrlFor = ( siteSlug: string, purchaseId: number ) =>
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
					name={ selectedSite.name }
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
	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSiteId ) );

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
	return isJetpackCloud() ? (
		<JetpackRnaActionCard
			headerText={ translate( 'You don’t have any active subscriptions for this site.' ) }
			subHeaderText={ translate(
				'Check out how Jetpack’s security, performance, and growth tools can improve your site.'
			) }
			ctaButtonLabel={ translate( 'Compare plans' ) }
			ctaButtonURL={
				selectedSiteId
					? `/partner-portal/issue-license?site_id=${ selectedSiteId }`
					: '/partner-portal/issue-license'
			}
		/>
	) : (
		<CompactCard className="subscriptions__list">
			<EmptyContent
				title={ translate( 'Looking to upgrade?' ) }
				line={ translate( 'You have made no purchases for this site.' ) }
				action={ translate( 'Upgrade now' ) }
				actionURL={ selectedSite ? `/plans/${ selectedSite.slug }` : '/plans' }
				illustration={ noSitesIllustration }
			/>
		</CompactCard>
	);
}
