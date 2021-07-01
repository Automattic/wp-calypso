/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import { isJetpackSearch, planHasJetpackSearch } from '@automattic/calypso-products';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import JetpackSearchContent from './content';
import JetpackSearchFooter from './footer';
import JetpackSearchLogo from './logo';
import JetpackSearchPlaceholder from './placeholder';
import JetpackSearchUpsell from './upsell';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isFetchingJetpackModules from 'calypso/state/selectors/is-fetching-jetpack-modules';
import { isRequestingSiteSettings, getSiteSettings } from 'calypso/state/site-settings/selectors';
import getJetpackModules from 'calypso/state/selectors/get-jetpack-modules';

export default function JetpackSearchMain( { siteId } ): ReactElement {
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const checkForSearchProduct = ( purchase ) => purchase.active && isJetpackSearch( purchase );
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const hasSearchProduct =
		sitePurchases.find( checkForSearchProduct ) || planHasJetpackSearch( site?.plan?.product_slug );
	const hasLoadedSitePurchases =
		useSelector( hasLoadedSitePurchasesFromServer ) && Array.isArray( sitePurchases );
	const onSettingsClick = useTrackCallback( undefined, 'calypso_jetpack_search_settings' );
	const isCloud = isJetpackCloud();
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	// Have we loaded the necessary purchases, site settings and modules? If not, show the placeholder.
	const settings = useSelector( ( state ) => getSiteSettings( state, siteId ) );
	const modules = useSelector( ( state ) => getJetpackModules( state, siteId ) );

	const isRequestingSettings =
		useSelector( ( state ) => isRequestingSiteSettings( state, siteId ) ) || ! settings;
	const isRequestingModules =
		useSelector( ( state ) => isFetchingJetpackModules( state, siteId ) ) ||
		( isJetpack && ! modules );

	// On Jetpack sites, we need to check if the search module is active.
	// On WPCOM Simple sites, we need to look for the jetpack_search_enabled flag.
	const isJetpackSearchModuleActive = useSelector( ( state ) =>
		isJetpackModuleActive( state, siteId, 'search' )
	);
	const isJetpackSearchSettingEnabled = useSelector( ( state ) =>
		getSiteSetting( state, siteId, 'jetpack_search_enabled' )
	);
	const isSearchEnabled = isJetpack ? isJetpackSearchModuleActive : isJetpackSearchSettingEnabled;

	if ( ! hasLoadedSitePurchases || isRequestingSettings || isRequestingModules ) {
		return <JetpackSearchPlaceholder siteId={ siteId } isJetpack={ isJetpack } />;
	}

	if ( ! hasSearchProduct ) {
		return <JetpackSearchUpsell />;
	}

	// Send Jetpack Cloud users to wp-admin settings and everyone else to Calypso blue
	const settingsUrl =
		isCloud && site?.options?.admin_url
			? `${ site.options.admin_url }admin.php?page=jetpack#/performance`
			: `/settings/performance/${ siteSlug }`;

	return (
		<Main className="jetpack-search">
			<DocumentHead title="Jetpack Search" />
			<SidebarNavigation />
			<PageViewTracker path="/jetpack-search/:site" title="Jetpack Search" />

			<JetpackSearchContent
				headerText={
					isSearchEnabled
						? translate( 'Jetpack Search is enabled on your site.' )
						: translate( 'Jetpack Search is disabled on your site.' )
				}
				bodyText={
					isSearchEnabled
						? translate( 'Your visitors are getting our fastest search experience.' )
						: translate( 'Enable it to ensure your visitors get our fastest search experience.' )
				}
				buttonLink={ settingsUrl }
				buttonText={ translate( 'Settings' ) }
				onClick={ onSettingsClick }
				iconComponent={ <JetpackSearchLogo /> }
			/>

			<JetpackSearchFooter />
		</Main>
	);
}
