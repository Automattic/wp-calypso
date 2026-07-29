import { getAgentManager } from '@automattic/agenttic-client';

// The agent keys AM chats run under.
const AGENT_KEYS_TO_CHECK = [ 'dolly', 'wp-orchestrator' ];

interface HistoryMessage {
	parts?: {
		data?: {
			toolId?: string;
			toolCallId?: string;
			arguments?: unknown;
		};
	}[];
}

type HistoryManager = {
	hasAgent?: ( agentKey: string ) => boolean;
	getConversationHistory?: ( agentKey: string ) => HistoryMessage[];
};

/**
 * Finds the most recent call id for the given tool in the live conversation
 * history — the id the agent knows the call by, and the id a checkpoint is
 * stored under.
 */
export function getToolCallIdFromConversationHistory( toolId: string ): string | null {
	const manager = getAgentManager() as unknown as HistoryManager | undefined;
	const matches: string[] = [];

	for ( const agentKey of AGENT_KEYS_TO_CHECK ) {
		if ( ! manager?.hasAgent?.( agentKey ) ) {
			continue;
		}

		for ( const message of manager.getConversationHistory?.( agentKey ) || [] ) {
			for ( const part of message.parts || [] ) {
				const data = part?.data;
				if ( data?.toolId !== toolId || ! data.toolCallId || ! data.arguments ) {
					continue;
				}

				matches.push( data.toolCallId );
			}
		}
	}

	return matches[ matches.length - 1 ] ?? null;
}
