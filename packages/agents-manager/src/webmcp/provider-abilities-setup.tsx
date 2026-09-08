import { getAgentManager } from '@automattic/agenttic-client';
import type { AbilitiesSetupHook } from '../utils/load-external-providers';

// External editor abilities currently register from a chat-owned hook. These
// inert chat actions let that hook mount for WebMCP without starting a chat run.
const INERT_CHAT_ACTIONS = {
	addMessage: () => {},
	clearMessages: () => {},
	clearSuggestions: () => {},
	getAgentManager,
	isProcessing: false,
	setIsThinking: () => {},
	deleteMarkedMessages: () => {},
	getSessionId: () => undefined,
	setIsBuildingSite: () => {},
	setThinkingMessage: () => {},
} satisfies Parameters< AbilitiesSetupHook >[ 0 ];

/**
 * Mounts the external provider's ability-setup hook while WebMCP is eligible,
 * so hook-dependent abilities register without opening the chat route.
 */
export function WebMcpProviderAbilitiesSetup( {
	useProviderAbilitiesSetup,
}: {
	useProviderAbilitiesSetup: AbilitiesSetupHook;
} ): null {
	useProviderAbilitiesSetup( INERT_CHAT_ACTIONS );
	return null;
}
