/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DesktopDownloadCard from './desktop-download-card.jsx';
import GetAppsIllustration from './illustration.jsx';
import MobileDownloadCard from './mobile-download-card.jsx';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';

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
