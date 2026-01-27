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
} from './extension-types';

export type ZendeskConversation = ReturnType< typeof Smooch.getConversations >[ number ];
export type ZendeskMessage = ZendeskConversation[ 'messages' ][ number ];
