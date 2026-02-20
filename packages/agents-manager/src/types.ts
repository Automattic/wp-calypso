import type { ServerConversationListItem } from '@automattic/agenttic-client';
import type { ZendeskConversation, ZendeskMessage } from '@automattic/zendesk-client';

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

export type { ZendeskConversation, ZendeskMessage };
export type LocalConversationListItem = Omit< ServerConversationListItem, 'chat_id' > & {
	chat_id?: number;
	conversation_id?: string;
	is_zendesk?: true;
};
