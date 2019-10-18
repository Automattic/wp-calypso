/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import MeSidebarNavigation from 'me/sidebar-navigation';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import GetAppsBlock from 'blocks/get-apps';

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
