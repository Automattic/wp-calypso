/** @format */
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
