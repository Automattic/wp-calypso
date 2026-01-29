import { ServerConversationListItem } from '@automattic/agenttic-client';
import type { getAgentManager } from '@automattic/agenttic-client';
import type Smooch from 'smooch';

/**
 * Common types used across the agents-manager package.
 */

export type {
	Ability,
	ToolProvider,
	ContextProvider,
	ClientContextType,
	BaseContextEntry,
	ContextEntry,
	Suggestion,
	BigSkyMessage,
} from './extension-types';

export type ZendeskConversation = ReturnType< typeof Smooch.getConversations >[ number ];
export type ZendeskMessage = ZendeskConversation[ 'messages' ][ number ];
export type LocalConversationListItem = Omit< ServerConversationListItem, 'chat_id' > & {
	chat_id?: number;
	conversation_id?: string;
	is_zendesk?: true;
};

/**
 * Extend Window interface for cross-bundle access to agentManager.
 * Used by components like Image Studio that need to access the shared agent.
 */
declare global {
	interface Window {
		__agentManager?: ReturnType< typeof getAgentManager >;
	}
}
