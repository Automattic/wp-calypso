import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import LearnSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/learn';
import ResourceCenterOverview from './resource-center/primary/overview';

export const learnResourceCenterContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Learn > Resource center" path={ context.path } />
			<ResourceCenterOverview />
		</>
	);
	context.secondary = <LearnSidebar path={ context.path } />;
	next();
};
