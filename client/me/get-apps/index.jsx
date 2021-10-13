import GetAppsBlock from 'calypso/blocks/get-apps';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';

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
