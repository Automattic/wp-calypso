import type { ZendeskConversation, OdieConversation } from '../types';

/**
 * Retrieves the creation date of the specified conversation.
 *
 * @returns The timestamp in milliseconds (e.g. 1745936539027), or undefined if not available
 */
export function getConversationCreatedAt(
	conversation: ZendeskConversation | OdieConversation
): number | undefined {
	if ( 'metadata' in conversation && conversation.metadata?.createdAt ) {
		return conversation.metadata.createdAt; // Format of this field is '1745936539027'
	} else if ( 'createdAt' in conversation && conversation.createdAt ) {
		return conversation.createdAt * 1000; // Format of this field is '1745936539.027'
	}

	return undefined;
}
