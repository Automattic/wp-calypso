import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import LearnSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/learn';
import AiMcpAvailableTools from './primary/available-tools';
import AiMcpConnectAgent from './primary/connect-agent';
import AiMcpOverview from './primary/overview';

export const aiMcpOverviewContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Resources and tools > AI and MCP" path={ context.path } />
			<AiMcpOverview />
		</>
	);
	context.secondary = <LearnSidebar path={ context.path } />;
	next();
};

export const aiMcpAvailableToolsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker
				title="Resources and tools > AI and MCP > Available tools"
				path={ context.path }
			/>
			<AiMcpAvailableTools />
		</>
	);
	context.secondary = <LearnSidebar path={ context.path } />;
	next();
};

export const aiMcpConnectContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker
				title="Resources and tools > AI and MCP > Connect external AI assistant"
				path={ context.path }
			/>
			<AiMcpConnectAgent />
		</>
	);
	context.secondary = <LearnSidebar path={ context.path } />;
	next();
};
