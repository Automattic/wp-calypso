import { ServerConversationListItem } from '@automattic/agenttic-client';
import { LocalConversationListItem, ZendeskConversation, ZendeskMessage } from '../types';

function normalizeZDMessage(
	message: ZendeskMessage | undefined
): ServerConversationListItem[ 'first_message' ] {
	if ( ! message ) {
		return undefined;
	}

	return {
		content: message.text,
		role: message.role === 'user' ? 'user' : 'bot',
		created_at: new Date( message.received * 1000 ).toISOString(),
	};
}

export function normalizeZendeskConversations(
	conversations: ZendeskConversation[]
): LocalConversationListItem[] {
	return conversations.map( ( conversation ) => {
		const createdAt = conversation.messages[ 0 ]
			? new Date( conversation.messages[ 0 ].received * 1000 ).toISOString()
			: new Date( conversation.lastUpdatedAt * 1000 ).toISOString();

		return {
			conversation_id: conversation.id,
			created_at: createdAt,
			first_message: normalizeZDMessage( conversation.messages[ 0 ] ),
			last_message: normalizeZDMessage( conversation.messages[ conversation.messages.length - 1 ] ),
			is_zendesk: true,
		};
	} );
}
