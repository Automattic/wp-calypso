/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import { isJetpackSearch, planHasJetpackSearch } from '@automattic/calypso-products';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import JetpackSearchPlaceholder from './placeholder';
import JetpackSearchUpsell from './upsell';
import { isRequestingSiteSettings, getSiteSettings } from 'calypso/state/site-settings/selectors';
import JetpackSearchDetails from './details';
import { getSite } from 'calypso/state/sites/selectors';

interface Props {
	siteId: number;
}

export default function JetpackSearchMainWpcomSimple( { siteId }: Props ): ReactElement {
	const site = useSelector( ( state ) => getSite( state, siteId ) );

	const checkForSearchProduct = ( purchase ) => purchase.active && isJetpackSearch( purchase );
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const hasSearchProduct =
		!! sitePurchases.find( checkForSearchProduct ) ||
		planHasJetpackSearch( site?.plan?.product_slug );
	const isFetchingPurchases = useSelector( isFetchingSitePurchases );
	const hasLoadedPurchases = useSelector( hasLoadedSitePurchasesFromServer );
	const isRequestingPurchases =
		isFetchingPurchases || ! hasLoadedPurchases || ! Array.isArray( sitePurchases );

	const settings = useSelector( ( state ) => getSiteSettings( state, siteId ) );

	const isRequestingSettings =
		useSelector( ( state ) => isRequestingSiteSettings( state, siteId ) ) || ! settings;

	// On WPCOM Simple sites, we need to look for the jetpack_search_enabled flag.
	const isJetpackSearchSettingEnabled = useSelector( ( state ) =>
		getSiteSetting( state, siteId, 'jetpack_search_enabled' )
	);

	// Have we loaded the necessary purchases and site settings? If not, show the placeholder.
	if ( isRequestingPurchases || isRequestingSettings ) {
		return <JetpackSearchPlaceholder siteId={ siteId } isJetpack={ false } />;
	}

	// If the user doesn't have any search products, try to sell them one.
	if ( ! hasSearchProduct ) {
		return <JetpackSearchUpsell />;
	}

	return <JetpackSearchDetails isSearchEnabled={ isJetpackSearchSettingEnabled } />;
}
