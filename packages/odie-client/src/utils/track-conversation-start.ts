import type { Chat, Message } from '../types';

// A human chat keeps the AI chat before it, so only messages that went through Zendesk count: they
// have a Smooch id, or a temporary id while they're queued.
const isUserMessageToHuman = ( message: Message ) =>
	message.role === 'user' && !! ( message.id || message.metadata?.temporary_id );

const isConversationStart = ( chat: Chat ) => {
	if ( chat?.provider === 'odie' ) {
		return ! chat.messages?.some( ( { role } ) => role === 'user' );
	}

	if ( chat?.provider?.startsWith( 'zendesk' ) ) {
		return ! chat.messages?.some( isUserMessageToHuman );
	}

	return false;
};

export function trackConversationStart(
	chat: Chat,
	message: string,
	trackEvent: ( event: string, props?: Record< string, unknown > ) => void
) {
	// Check before sendMessage appends the user's message to the history.
	if ( isConversationStart( chat ) ) {
		trackEvent( 'chat_conversation_start', {
			message_length: message.length,
			provider: chat?.provider,
		} );
	}
}
