import { ProductIcon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import versionCompare from 'calypso/lib/version-compare';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
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
	const isSearchEnabled = useSelector( ( state ) =>
		getSiteSetting( state, siteId, 'jetpack_search_enabled' )
	);
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
			<QuerySiteSettings siteId={ siteId } />
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
