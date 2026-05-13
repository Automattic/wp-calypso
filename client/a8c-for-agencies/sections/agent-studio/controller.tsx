import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import LearnSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/learn';
import AgentStudioOverview from './primary/overview';
import AgentStudioProjectDetail from './primary/project-detail';

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

export const agentStudioProjectContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Resources and tools > Agent studio > Project" path={ context.path } />
			<AgentStudioProjectDetail projectId={ context.params.projectId } />
		</>
	);
	context.secondary = <LearnSidebar path={ context.path } />;
	next();
};
