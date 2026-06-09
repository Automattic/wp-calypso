// global.d.ts declares ambient globals (e.g. agentsManagerData) that are injected server-side.
// Ambient declaration files cannot be `import`ed; a triple-slash reference is required to ensure
// the global is visible when TypeScript resolves this file via the import graph rather than the
// tsconfig include list (e.g. during sandbox / CI builds).
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../global.d.ts" />

const JETPACK_AI_SIDEBAR_PROVIDER_PATH = 'jetpack-ai-sidebar.provider.mjs';
const POST_EDITOR_SECTION_NAME = 'gutenberg';

export type AgentProviderEntry = string | object;

type AgentsManagerInlineData = {
	agentProviders?: AgentProviderEntry[];
	jetpackAiSidebarPreview?: unknown;
	sectionName?: unknown;
};

type JetpackScriptData = {
	site?: {
		host?: unknown;
	};
};

function getAgentsManagerInlineData(): AgentsManagerInlineData | undefined {
	return typeof agentsManagerData !== 'undefined'
		? ( agentsManagerData as unknown as AgentsManagerInlineData )
		: undefined;
}

function getInlineAgentProviders( data?: AgentsManagerInlineData ): AgentProviderEntry[] {
	return Array.isArray( data?.agentProviders ) ? data.agentProviders : [];
}

function getEditorSiteTypeSimpleStatus(): boolean | undefined {
	const siteType = ( globalThis as unknown as { _currentSiteType?: unknown } )._currentSiteType;
	return typeof siteType === 'string' ? siteType === 'simple' : undefined;
}

function getJetpackScriptDataSimpleStatus(): boolean | undefined {
	const host = ( globalThis as unknown as { JetpackScriptData?: JetpackScriptData } )
		.JetpackScriptData?.site?.host;
	return typeof host === 'string' ? host === 'wpcom' : undefined;
}

function isWpcomSimpleSite(): boolean {
	return getEditorSiteTypeSimpleStatus() ?? getJetpackScriptDataSimpleStatus() ?? false;
}

export function isJetpackAiSidebarProvider( provider: unknown ): boolean {
	return typeof provider === 'string' && provider.includes( JETPACK_AI_SIDEBAR_PROVIDER_PATH );
}

function shouldDisableJetpackAiSidebarForCurrentSite( data?: AgentsManagerInlineData ): boolean {
	if ( data?.sectionName !== POST_EDITOR_SECTION_NAME ) {
		return false;
	}

	if ( isWpcomSimpleSite() ) {
		return false;
	}

	return (
		data.jetpackAiSidebarPreview !== undefined ||
		getInlineAgentProviders( data ).some( isJetpackAiSidebarProvider )
	);
}

export function getAgentProvidersWithJetpackAiSidebarGated(): AgentProviderEntry[] {
	const data = getAgentsManagerInlineData();
	const providers = getInlineAgentProviders( data );

	if ( ! shouldDisableJetpackAiSidebarForCurrentSite( data ) ) {
		return providers;
	}

	return providers.filter( ( provider ) => ! isJetpackAiSidebarProvider( provider ) );
}

export function shouldSuppressAgentsManagerWhenJetpackAiSidebarGated(): boolean {
	const data = getAgentsManagerInlineData();

	return (
		shouldDisableJetpackAiSidebarForCurrentSite( data ) &&
		getAgentProvidersWithJetpackAiSidebarGated().length === 0
	);
}
