/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import { isJetpackSearch, planHasJetpackSearch } from '@automattic/calypso-products';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import JetpackSearchPlaceholder from './placeholder';
import JetpackSearchUpsell from './upsell';
import { isRequestingSiteSettings, getSiteSettings } from 'calypso/state/site-settings/selectors';
import JetpackSearchDetails from './details';

interface Props {
	siteId: number;
}

export default function JetpackSearchMainWpcomSimple( { siteId }: Props ): ReactElement {
	const site = useSelector( getSelectedSite );
	const checkForSearchProduct = ( purchase ) => purchase.active && isJetpackSearch( purchase );
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const hasSearchProduct =
		sitePurchases.find( checkForSearchProduct ) || planHasJetpackSearch( site?.plan?.product_slug );
	const hasLoadedSitePurchases =
		useSelector( hasLoadedSitePurchasesFromServer ) && Array.isArray( sitePurchases );

	// Have we loaded the necessary purchases and site settings? If not, show the placeholder.
	const settings = useSelector( ( state ) => getSiteSettings( state, siteId ) );

	const isRequestingSettings =
		useSelector( ( state ) => isRequestingSiteSettings( state, siteId ) ) || ! settings;

	// On WPCOM Simple sites, we need to look for the jetpack_search_enabled flag.
	const isJetpackSearchSettingEnabled = useSelector( ( state ) =>
		getSiteSetting( state, siteId, 'jetpack_search_enabled' )
	);

	if ( ! hasLoadedSitePurchases || isRequestingSettings ) {
		return <JetpackSearchPlaceholder siteId={ siteId } isJetpack={ false } />;
	}

	if ( ! hasSearchProduct ) {
		return <JetpackSearchUpsell />;
	}

	return <JetpackSearchDetails isSearchEnabled={ isJetpackSearchSettingEnabled } />;
}
