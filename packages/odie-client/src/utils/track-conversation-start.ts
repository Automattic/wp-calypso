import type { Chat } from '../types';

export function trackConversationStart(
	chat: Chat,
	message: string,
	trackEvent: ( event: string, props?: Record< string, unknown > ) => void
) {
	// Check before sendMessage appends the user's message to the history.
	const isConversationStart =
		chat?.provider === 'odie' && ! chat.messages?.some( ( { role } ) => role === 'user' );

	if ( isConversationStart ) {
		trackEvent( 'chat_conversation_start', {
			message_length: message.length,
			provider: chat?.provider,
		} );
	}
}
