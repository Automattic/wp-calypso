import { getAgentManager } from '@automattic/agenttic-client';
import { DOLLY_AGENT_ID, ORCHESTRATOR_AGENT_ID } from '../constants';

// The agent keys AM chats run under.
const AGENT_KEYS_TO_CHECK = [ DOLLY_AGENT_ID, ORCHESTRATOR_AGENT_ID ];

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
	let latestToolCallId: string | null = null;

	for ( const agentKey of AGENT_KEYS_TO_CHECK ) {
		if ( ! manager?.hasAgent?.( agentKey ) ) {
			continue;
		}

		for ( const message of manager.getConversationHistory?.( agentKey ) || [] ) {
			for ( const part of message.parts || [] ) {
				const data = part?.data;
				if ( data?.toolId === toolId && data.toolCallId && data.arguments ) {
					latestToolCallId = data.toolCallId;
				}
			}
		}
	}

	return latestToolCallId;
}
