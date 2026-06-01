import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import LearnSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/learn';
import AgentStudioBrief from './primary/brief';
import AgentStudioOutputDetail from './primary/output-detail';
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

export const agentStudioBriefContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker
				title="Resources and tools > Agent studio > Brief an agent"
				path={ context.path }
			/>
			<AgentStudioBrief agentId={ context.params.agentId } />
		</>
	);
	context.secondary = <LearnSidebar path={ context.path } />;
	next();
};

export const agentStudioOutputContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker
				title="Resources and tools > Agent studio > Deliverable"
				path={ context.path }
			/>
			<AgentStudioOutputDetail outputId={ context.params.outputId } />
		</>
	);
	context.secondary = <LearnSidebar path={ context.path } />;
	next();
};
