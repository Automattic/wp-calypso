/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { isJetpackSearch, planHasJetpackSearch } from '@automattic/calypso-products';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import JetpackSearchPlaceholder from './placeholder';
import JetpackSearchUpsell from './upsell';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isFetchingJetpackModules from 'calypso/state/selectors/is-fetching-jetpack-modules';
import getJetpackModules from 'calypso/state/selectors/get-jetpack-modules';
import JetpackSearchDetails from './details';

interface Props {
	siteId: number;
}

export default function JetpackSearchMainJetpack( { siteId }: Props ): ReactElement {
	const site = useSelector( getSelectedSite );
	const checkForSearchProduct = ( purchase ) => purchase.active && isJetpackSearch( purchase );
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const hasSearchProduct =
		sitePurchases.find( checkForSearchProduct ) || planHasJetpackSearch( site?.plan?.product_slug );
	const hasLoadedSitePurchases =
		useSelector( hasLoadedSitePurchasesFromServer ) && Array.isArray( sitePurchases );

	// Have we loaded the necessary purchases and modules? If not, show the placeholder.
	const modules = useSelector( ( state ) => getJetpackModules( state, siteId ) );

	const isRequestingModules =
		useSelector( ( state ) => isFetchingJetpackModules( state, siteId ) ) || ! modules;

	// On Jetpack sites, we need to check if the search module is active, rather than checking settings.
	const isJetpackSearchModuleActive = useSelector( ( state ) =>
		isJetpackModuleActive( state, siteId, 'search' )
	);

	if ( ! hasLoadedSitePurchases || isRequestingModules ) {
		return <JetpackSearchPlaceholder siteId={ siteId } isJetpack={ true } />;
	}

	if ( ! hasSearchProduct ) {
		return <JetpackSearchUpsell />;
	}

	return <JetpackSearchDetails isSearchEnabled={ isJetpackSearchModuleActive } />;
}
