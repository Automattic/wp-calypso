import { createOdieBotId, isOdieBotId } from '@automattic/agenttic-client';
import { isReaderChatAgent } from './is-reader-chat-agent';

export function getConversationBotId( agentId: string, hasAgentParam: boolean ): string {
	if ( hasAgentParam || isOdieBotId( agentId ) || isReaderChatAgent( agentId ) ) {
		return agentId;
	}

	return createOdieBotId( agentId );
}
