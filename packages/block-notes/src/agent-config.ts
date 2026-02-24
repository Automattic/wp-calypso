/**
 * Block Notes Agent Configuration
 *
 * Creates agent config specific to the Block Notes context.
 * Wraps the shared createAgentConfig with block-notes-specific metadata.
 */

import { createAgentConfig } from '@automattic/agents-manager/src/utils/agent-config';
import { createToolProvider } from './utils/tool-provider';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';

export interface AgentConfigFactory {
	createAgentConfig: ( sessionId: string ) => Promise< UseAgentChatConfig >;
}

/**
 * Create agent configuration for block notes context.
 * Wrapper around createAgentConfig that passes block-notes-specific context and tool provider.
 *
 * @param sessionId Session ID for the agent chat
 * @returns Promise resolving to complete UseAgentChatConfig
 */
export async function createBlockNotesAgentConfig(
	sessionId: string
): Promise< UseAgentChatConfig > {
	return createAgentConfig( {
		sessionId,
		environment: 'calypso',
		toolProvider: createToolProvider(),
		contextProvider: {
			getClientContext: () => ( {
				blockNotes: { isActive: true },
				environment: 'wp-block-notes',
				url: window.location.href,
				pathname: window.location.pathname,
				search: window.location.search,
			} ),
		},
	} );
}

export const blockNotesAgentConfig: AgentConfigFactory = {
	createAgentConfig: createBlockNotesAgentConfig,
};
