import type { ZendeskConversation, OdieConversation } from '../types';

/**
 * Retrieves the creation date of the specified conversation, if possible.
 */
export function getConversationCreatedAt(
	conversation: ZendeskConversation | OdieConversation
): number | undefined {
	if ( 'metadata' in conversation && conversation.metadata?.createdAt ) {
		return conversation.metadata.createdAt;
	} else if ( 'createdAt' in conversation && conversation.createdAt ) {
		return conversation.createdAt;
	}

	return undefined;
}
