import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import LearnSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/learn';
import AgentStudioOverview from './primary/overview';

export const agentStudioContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Resources and tools > Agent studio" path={ context.path } />
			<AgentStudioOverview />
		</>
	);
	context.secondary = <LearnSidebar path={ context.path } />;
	next();
};
