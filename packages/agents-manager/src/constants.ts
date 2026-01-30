export const API_BASE_URL = 'https://public-api.wordpress.com';

export const ORCHESTRATOR_AGENT_URL = `${ API_BASE_URL }/wpcom/v2/ai/agent`;
export const ORCHESTRATOR_AGENT_ID = 'wp-orchestrator';

export const LOCAL_TOOL_RUNNING_MESSAGE = 'local_tool_running';

/**
 * Get agent configuration from query string parameters or defaults.
 * Allows overriding agent ID and version via URL for testing purposes.
 *
 * Query parameters:
 * - `agent`: Override the agent ID (e.g., ?agent=wpcom-workflow-support_chat)
 * - `version`: Override the agent version (e.g., ?version=1.0.25)
 */
export function getAgentConfig(): { agentId: string; version?: string } {
	const urlSearchParams = new URLSearchParams( window.location.search );
	const agentIdParam = urlSearchParams.get( 'agent' );
	const versionParam = urlSearchParams.get( 'version' );

	return {
		agentId: agentIdParam || ORCHESTRATOR_AGENT_ID,
		version: versionParam || undefined,
	};
}
