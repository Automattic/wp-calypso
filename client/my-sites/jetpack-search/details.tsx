import { translate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import JetpackSearchContent from './content';
import JetpackSearchFooter from './footer';
import JetpackSearchLogo from './logo';

import './style.scss';

export default function JetpackSearchDetails(): ReactElement {
	const siteId = useSelector( getSelectedSiteId ) || -1;
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isSearchEnabled = useSelector( ( state ) =>
		getSiteSetting( state, siteId, 'jetpack_search_enabled' )
	);
	const isCloud = isJetpackCloud();
	const onSettingsClick = useTrackCallback( undefined, 'calypso_jetpack_search_settings' );

	// Send Jetpack Cloud users to wp-admin settings and everyone else to Calypso blue
	const settingsUrl =
		isCloud && site?.options?.admin_url
			? `${ site.options.admin_url }admin.php?page=jetpack#/performance`
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
				iconComponent={ <JetpackSearchLogo /> }
			/>

			<JetpackSearchFooter />
		</Main>
	);
}
