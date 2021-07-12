/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSite } from 'calypso/state/sites/selectors';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import {
	getSitePurchases,
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
} from 'calypso/state/purchases/selectors';
import JetpackSearchPlaceholder from './placeholder';
import JetpackSearchUpsell from './upsell';
import { isRequestingSiteSettings, getSiteSettings } from 'calypso/state/site-settings/selectors';
import JetpackSearchDetails from './details';
import { hasJetpackSearchPurchaseOrPlan } from './purchases';

interface Props {
	siteId: number;
}

export default function JetpackSearchMainWpcomSimple( { siteId }: Props ): ReactElement {
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const hasSearchProduct = hasJetpackSearchPurchaseOrPlan(
		sitePurchases,
		site?.plan?.product_slug
	);
	const isFetchingPurchases = useSelector( isFetchingUserPurchases );
	const hasLoadedPurchases = useSelector( hasLoadedUserPurchasesFromServer );
	const isRequestingPurchases =
		! hasLoadedPurchases || isFetchingPurchases || ! Array.isArray( sitePurchases );

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
