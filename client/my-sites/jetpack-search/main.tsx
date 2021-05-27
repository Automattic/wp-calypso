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
import FormattedHeader from 'calypso/components/formatted-header';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import JetpackSearchUpsell from './upsell';
import JetpackSearchPlaceholder from './placeholder';
import JetpackSearchFooter from './footer';
import { isJetpackSearch, planHasJetpackSearch } from '@automattic/calypso-products';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import getJetpackModules from 'calypso/state/selectors/get-jetpack-modules';
import Upsell from 'calypso/components/jetpack/upsell';
import JetpackSearchLogo from './logo';

export default function JetpackSearchMain(): ReactElement {
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const checkForSearchProduct = ( purchase ) => purchase.active && isJetpackSearch( purchase );
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const hasSearchProduct =
		sitePurchases.find( checkForSearchProduct ) || planHasJetpackSearch( site?.plan?.product_slug );
	const hasLoadedSitePurchases = useSelector( hasLoadedSitePurchasesFromServer );
	const onSettingsClick = useTrackCallback( undefined, 'calypso_jetpack_search_settings' );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const siteSettings = useSelector( ( state ) => getSiteSettings( state, siteId ) );
	const jetpackModules = useSelector( ( state ) => getJetpackModules( state, siteId ) );

	// On Jetpack sites, we need to check if the search module is active.
	// On WPCOM Simple sites, we need to look for the jetpack_search_enabled flag.
	const isJetpackSearchModuleActive = useSelector( ( state ) =>
		isJetpackModuleActive( state, siteId, 'search' )
	);
	const isJetpackSearchSettingEnabled = useSelector( ( state ) =>
		getSiteSetting( state, siteId, 'jetpack_search_enabled' )
	);
	const isSearchEnabled = isJetpack ? isJetpackSearchModuleActive : isJetpackSearchSettingEnabled;
	const isRelevantSettingLoaded = isJetpack
		? !! jetpackModules
		: siteSettings && 'jetpack_search_enabled' in siteSettings;

	if ( ! hasLoadedSitePurchases || ! isRelevantSettingLoaded ) {
		return <JetpackSearchPlaceholder siteId={ siteId } />;
	}

	if ( ! hasSearchProduct ) {
		return <JetpackSearchUpsell />;
	}

	const isCloud = isJetpackCloud();

	// Send Jetpack Cloud users to wp-admin settings and everyone else to Calypso blue
	const settingsUrl = isCloud
		? `${ site.options.admin_url }admin.php?page=jetpack#/performance`
		: `/settings/performance/${ siteSlug }`;

	return (
		<Main className="jetpack-search">
			<DocumentHead title="Jetpack Search" />
			<SidebarNavigation />
			<PageViewTracker path="/jetpack-search/:site" title="Jetpack Search" />
			<QuerySiteSettings siteId={ siteId } />

			<Upsell
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
