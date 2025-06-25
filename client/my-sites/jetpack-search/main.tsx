import { ProductIcon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import versionCompare from 'calypso/lib/version-compare';
import { useSelector } from 'calypso/state';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import JetpackSearchContent from './content';
import JetpackSearchFooter from './footer';

import './style.scss';

export default function SearchMain() {
	const siteId = useSelector( getSelectedSiteId ) || -1;
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	// NOTE: Querying for active modules and site settings handled by the UpsellSwitch component.
	const isSearchEnabled = useSelector( ( state ) => {
		// On Jetpack sites, we need to check if the search module is active, rather than checking settings.
		if ( isJetpack ) {
			return Boolean( isJetpackModuleActive( state, siteId, 'search', true ) );
		}
		return getSiteSetting( state, siteId, 'jetpack_search_enabled' );
	} );

	const isCloud = isJetpackCloud();
	const onSettingsClick = useTrackCallback( undefined, 'calypso_jetpack_search_settings' );

	const siteJetpackVersion = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'jetpack_version' )
	);

	const searchDashboardUrl =
		siteJetpackVersion && versionCompare( siteJetpackVersion, '10.0-beta', '<' )
			? 'admin.php?page=jetpack#/performance'
			: 'admin.php?page=jetpack-search';

	// Send Jetpack Cloud users to wp-admin settings and everyone else to Calypso blue
	const settingsUrl =
		isCloud && site?.options?.admin_url
			? `${ site.options.admin_url }${ searchDashboardUrl }`
			: `/settings/performance/${ siteSlug }`;

	return (
		<Main className="jetpack-search">
			<DocumentHead title="Jetpack Search" />
			{ isCloud && <SidebarNavigation /> }
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
				iconComponent={ <ProductIcon slug="jetpack_search" /> }
			/>
			<JetpackSearchFooter />
		</Main>
	);
}
