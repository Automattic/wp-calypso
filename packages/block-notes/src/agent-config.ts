/**
 * Block Notes Agent Configuration
 *
 * Creates agent config specific to the Block Notes context.
 * Wraps the shared createAgentConfig with block-notes-specific metadata.
 */

import { AGENT_URL, createAgentConfig } from '@ai/wp-orchestrator';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';

/**
 * Create agent configuration for block notes context.
 * Wrapper around createAgentConfig that passes block-notes-specific context.
 *
 * @param sessionId Session ID for the agent chat
 * @returns Promise resolving to complete UseAgentChatConfig
 */
export async function createBlockNotesAgentConfig(
	sessionId: string
): Promise< UseAgentChatConfig > {
	return createAgentConfig( sessionId, {
		blockNotes: {
			isActive: true,
		},
		environment: 'wp-block-notes',
	} );
}

export const blockNotesAgentConfig = {
	url: AGENT_URL,
	createAgentConfig: createBlockNotesAgentConfig,
};
