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
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
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

export default function JetpackSearchMain(): ReactElement {
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const checkForSearchProduct = ( purchase ) => purchase.active && isJetpackSearch( purchase );
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const isSearchEnabled = useSelector( ( state ) =>
		getSiteSetting( state, siteId, 'jetpack_search_enabled' )
	);
	const hasSearchProduct =
		sitePurchases.find( checkForSearchProduct ) || planHasJetpackSearch( site?.plan?.product_slug );
	const hasLoadedSitePurchases = useSelector( hasLoadedSitePurchasesFromServer );
	const onSettingsClick = useTrackCallback( undefined, 'calypso_jetpack_search_settings' );
	const isCloud = isJetpackCloud();

	// Send Jetpack Cloud users to wp-admin settings and everyone else to Calypso blue
	const settingsUrl =
		isCloud && site?.options?.admin_url
			? `${ site.options.admin_url }admin.php?page=jetpack#/performance`
			: `/settings/performance/${ siteSlug }`;

	if ( ! hasLoadedSitePurchases ) {
		return <JetpackSearchPlaceholder siteId={ siteId } />;
	}

	if ( ! hasSearchProduct ) {
		return <JetpackSearchUpsell />;
	}

	return (
		<Main className="jetpack-search">
			<DocumentHead title="Jetpack Search" />
			<SidebarNavigation />
			<PageViewTracker path="/jetpack-search/:site" title="Jetpack Search" />
			<QuerySiteSettings siteId={ siteId } />

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
