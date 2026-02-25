import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import LearnSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/learn';
import DevToolsOverview from './primary/dev-tools-overview';

export const devToolsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Resources and tools > Developer tools" path={ context.path } />
			<DevToolsOverview />
		</>
	);
	context.secondary = <LearnSidebar path={ context.path } />;
	next();
};
