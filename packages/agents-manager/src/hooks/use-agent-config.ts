import { ORCHESTRATOR_AGENT_ID, UNIFIED_CHAT_AGENT_ID } from '../constants';
import { useUnifiedAiChat } from './use-unified-ai-chat';

/**
 * React hook for agent configuration from query string parameters or defaults.
 * Allows overriding agent ID and version via URL for testing purposes.
 *
 * Query parameters:
 * - `agent`: Override the agent ID (e.g., ?agent=wpcom-workflow-support_chat)
 * - `version`: Override the agent version (e.g., ?version=1.0.25)
 */
export function useAgentConfig(): { agentId: string; version?: string } {
	const { data: useUnifiedExperience } = useUnifiedAiChat();
	const urlSearchParams = new URLSearchParams( window.location.search );
	const agentIdParam = urlSearchParams.get( 'agent' );
	const versionParam = urlSearchParams.get( 'version' );

	const defaultAgentId = useUnifiedExperience ? UNIFIED_CHAT_AGENT_ID : ORCHESTRATOR_AGENT_ID;

	return {
		agentId: agentIdParam || defaultAgentId,
		version: versionParam || undefined,
	};
}
