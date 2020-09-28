/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import PurchasesSite from 'me/purchases/purchases-site/index.jsx';
import {
	getSitePurchases,
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
} from 'state/purchases/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import NoSitesMessage from 'components/empty-content/no-sites-message';
import { CompactCard } from '@automattic/components';
import EmptyContent from 'components/empty-content';
import './style.scss';

export default function SubscriptionsContent() {
	const isFetchingPurchases = useSelector( ( state ) => isFetchingUserPurchases( state ) );
	const hasLoadedPurchases = useSelector( ( state ) => hasLoadedUserPurchasesFromServer( state ) );
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) );
	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSiteId ) );

	// If we are loading purchases, show the placeholder
	if ( isFetchingPurchases && ! hasLoadedPurchases ) {
		return <PurchasesSite isPlaceholder />;
	}

	// If there is no selected site, show the "no sites" page
	if ( ! selectedSiteId ) {
		return <NoSitesMessage />;
	}

	// If there is a selected site but no site data, show the placeholder
	if ( ! selectedSite?.ID ) {
		return <PurchasesSite isPlaceholder />;
	}

	const getManagePurchaseUrlFor = ( siteSlug: string, purchaseId: number ) =>
		`/purchases/subscriptions/${ siteSlug }/${ purchaseId }`;

	// If there are purchases, show them
	if ( hasLoadedPurchases && purchases.length ) {
		return (
			<PurchasesSite
				showHeader={ false }
				getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
				key={ selectedSite.ID }
				siteId={ selectedSite.ID }
				name={ selectedSite.name }
				domain={ selectedSite.domain }
				slug={ selectedSite.slug }
				purchases={ purchases }
			/>
		);
	}

	// If there is selected site data but no purchases, show the "no purchases" page
	return <NoPurchasesMessage />;
}

function NoPurchasesMessage() {
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) );
	const translate = useTranslate();
	return (
		<CompactCard className="subscriptions__list--empty">
			<EmptyContent
				title={ translate( 'Looking to upgrade?' ) }
				line={ translate(
					'Our plans give your site the power to thrive. Find the plan that works for you.'
				) }
				action={ translate( 'Upgrade now' ) }
				actionURL={ selectedSite ? `/plans/${ selectedSite.slug }` : '/plans' }
				illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
			/>
		</CompactCard>
	);
}
