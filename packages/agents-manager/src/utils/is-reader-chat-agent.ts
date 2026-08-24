import { getAgentsManagerInlineData } from './get-agents-manager-inline-data';

/**
 * Reader-chat agent identification helpers.
 *
 * Reader-chat runs on public blog frontends (logged-out visitors) under a
 * constrained set of agent IDs. Several components branch on this context
 * to hide wp-admin-only affordances (docking, history, etc.). Keeping the
 * ID list in one place avoids drift if a new reader-chat variant is added.
 */

export const READER_CHAT_AGENT_IDS = [ 'reader-chat', 'p2-reader-chat' ] as const;

type ReaderChatAgentId = ( typeof READER_CHAT_AGENT_IDS )[ number ];

/**
 * True if the given agentId is a reader-chat variant.
 */
export function isReaderChatAgent( agentId: string | undefined | null ): boolean {
	return !! agentId && ( READER_CHAT_AGENT_IDS as readonly string[] ).includes( agentId );
}

/**
 * True if the current host is running under a reader-chat agent.
 * Reads from `agentsManagerData.agentId` (set by the reader-chat entry before
 * AgentsManager mounts). Safe in SSR — returns `false` when `window` is unavailable.
 */
export function isReaderChatHost(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	return isReaderChatAgent( getAgentsManagerInlineData()?.agentId );
}

export type { ReaderChatAgentId };
