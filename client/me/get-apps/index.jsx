/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import MeSidebarNavigation from 'me/sidebar-navigation';
import Main from 'components/main';
import GetAppsIllustration from './illustration.jsx';
import DesktopDownloadCard from './desktop-download-card.jsx';
import MobileDownloadCard from './mobile-download-card.jsx';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import config from 'config';

/**
 * Style dependencies
 */
import './style.scss';

export const GetApps = () => {
	return (
		<Main className="get-apps">
			<PageViewTracker path="/me/get-apps" title="Me > Get Apps" />
			<MeSidebarNavigation />
			<GetAppsIllustration />
			<MobileDownloadCard />
			{ ! config( 'env_id' ).startsWith( 'desktop' ) && <DesktopDownloadCard /> }
		</Main>
	);
};

export default GetApps;
