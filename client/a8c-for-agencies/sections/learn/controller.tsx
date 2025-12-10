import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import LearnSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/learn';
import ResourceCenter from './resource-center';

export const learnResourceCenterContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Learn > Resource center" path={ context.path } />
			<ResourceCenter />
		</>
	);
	context.secondary = <LearnSidebar path={ context.path } />;
	next();
};
