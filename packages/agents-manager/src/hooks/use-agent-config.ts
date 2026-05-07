import { ORCHESTRATOR_AGENT_ID, UNIFIED_CHAT_AGENT_ID } from '../constants';
import { useUnifiedAiChat } from './use-unified-ai-chat';

interface AgentConfig {
	agentId: string;
	version?: string;
	isLoading: boolean;
}

/**
 * Resolves agent ID and version from host configuration, URL parameters, or defaults.
 * `isLoading` is true until the default agent ID is determined.
 *
 * Priority chain:
 * 1. Explicit host `agentId` prop (hard override, e.g. Reader Chat)
 * 2. `?agent=` URL param (testing override)
 * 3. `agentsManagerData.agentId` (host-level override, e.g., WooCommerce AI)
 * 4. Unified experience toggle (`useUnifiedAiChat`)
 * 5. `ORCHESTRATOR_AGENT_ID` (default)
 *
 * Query parameters:
 * - `agent`: Override the agent ID (e.g., `?agent=wpcom-workflow-support_chat`)
 * - `version`: Override the agent version (e.g., `?version=1.0.25`)
 */
export function useAgentConfig( hostAgentId?: string ): AgentConfig {
	const { data: useUnifiedExperience, isLoading } = useUnifiedAiChat( ! hostAgentId );
	const urlSearchParams = new URLSearchParams( window.location.search );
	const agentIdParam = urlSearchParams.get( 'agent' );
	const versionParam = urlSearchParams.get( 'version' );

	const inlineAgentId =
		typeof agentsManagerData !== 'undefined' ? agentsManagerData?.agentId : undefined;
	const unifiedChatAgentId = useUnifiedExperience ? UNIFIED_CHAT_AGENT_ID : undefined;

	return {
		agentId:
			hostAgentId || agentIdParam || inlineAgentId || unifiedChatAgentId || ORCHESTRATOR_AGENT_ID,
		version: versionParam || undefined,
		isLoading: hostAgentId ? false : isLoading,
	};
}
