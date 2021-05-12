/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import GetAppsBlock from 'calypso/blocks/get-apps';

export const GetApps = () => {
	return (
		<Main className="get-apps">
			<PageViewTracker path="/me/get-apps" title="Me > Get Apps" />
			<MeSidebarNavigation />
			<GetAppsBlock />
		</Main>
	);
};

export default GetApps;
