/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import MeSidebarNavigation from 'me/sidebar-navigation';
import Main from 'components/main';
import GetAppsIllustration from './illustration.js';
import DesktopDownloadCard from './desktop-download-card.js';
import MobileDownloadCard from './mobile-download-card.js';

export const GetApps = () => {
	return (
		<Main className="get-apps">
			<MeSidebarNavigation />
			<GetAppsIllustration />
			<MobileDownloadCard />
			<DesktopDownloadCard />
		</Main>
	);
};

export default GetApps;
