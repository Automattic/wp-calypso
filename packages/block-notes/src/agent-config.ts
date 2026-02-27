/**
 * Block Notes Agent Configuration
 *
 * Creates agent config specific to the Block Notes context.
 * Passes siteId/blogId to agent config for API authentication
 */

import { createAgentConfig } from '@automattic/agents-manager/src/utils/agent-config';
import { createToolProvider } from './utils/tool-provider';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';

export interface AgentConfigFactory {
	createAgentConfig: ( sessionId: string ) => Promise< UseAgentChatConfig >;
}

/**
 * Get the current blog/site ID from WordPress.com runtime globals.
 * @returns The site ID as a number, or null if not available.
 */
export function getBlogId(): number | null {
	return (
		window._currentSiteId || Number( window.Jetpack_Editor_Initial_State?.wpcomBlogId ) || null
	);
}

/**
 * Create agent configuration for block notes context.
 * @param sessionId Session ID for the agent chat
 * @returns Promise resolving to complete UseAgentChatConfig
 */
export async function createBlockNotesAgentConfig(
	sessionId: string
): Promise< UseAgentChatConfig > {
	return createAgentConfig( {
		sessionId,
		siteId: getBlogId() ?? undefined,
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
