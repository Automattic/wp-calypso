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
import JetpackSearchContent from './content';
import JetpackSearchFooter from './footer';
import JetpackSearchLogo from './logo';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

interface Props {
	isSearchEnabled: boolean;
}

export default function JetpackSearchDetails( { isSearchEnabled }: Props ): ReactElement {
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isCloud = isJetpackCloud();
	const onSettingsClick = useTrackCallback( undefined, 'calypso_jetpack_search_settings' );

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
