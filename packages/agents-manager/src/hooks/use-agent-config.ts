import { ORCHESTRATOR_AGENT_ID, UNIFIED_CHAT_AGENT_ID } from '../constants';
import { useUnifiedAiChat } from './use-unified-ai-chat';

interface AgentConfig {
	agentId: string;
	version?: string;
	isLoading: boolean;
}

/**
 * Resolves agent ID and version from URL parameters or defaults.
 * `isLoading` is true until the default agent ID is determined.
 *
 * Query parameters:
 * - `agent`: Override the agent ID (e.g., `?agent=wpcom-workflow-support_chat`)
 * - `version`: Override the agent version (e.g., `?version=1.0.25`)
 */
export function useAgentConfig(): AgentConfig {
	const { data: useUnifiedExperience, isLoading } = useUnifiedAiChat();
	const urlSearchParams = new URLSearchParams( window.location.search );
	const agentIdParam = urlSearchParams.get( 'agent' );
	const versionParam = urlSearchParams.get( 'version' );

	const defaultAgentId = useUnifiedExperience ? UNIFIED_CHAT_AGENT_ID : ORCHESTRATOR_AGENT_ID;

	return {
		agentId: agentIdParam || defaultAgentId,
		version: versionParam || undefined,
		isLoading,
	};
}
