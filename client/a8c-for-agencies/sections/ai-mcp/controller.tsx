import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import LearnSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/learn';
import AiMcpConnectAgent from './primary/connect-agent';
import AiMcpOverview from './primary/overview';
import AiMcpReadTools from './primary/read-tools';
import AiMcpStarterPrompts from './primary/starter-prompts';
import AiMcpWriteTools from './primary/write-tools';

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

export const aiMcpReadToolsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Resources and tools > AI and MCP > Read" path={ context.path } />
			<AiMcpReadTools />
		</>
	);
	context.secondary = <LearnSidebar path={ context.path } />;
	next();
};

export const aiMcpWriteToolsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Resources and tools > AI and MCP > Write" path={ context.path } />
			<AiMcpWriteTools />
		</>
	);
	context.secondary = <LearnSidebar path={ context.path } />;
	next();
};

export const aiMcpStarterPromptsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker
				title="Resources and tools > AI and MCP > Starter prompts"
				path={ context.path }
			/>
			<AiMcpStarterPrompts />
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
