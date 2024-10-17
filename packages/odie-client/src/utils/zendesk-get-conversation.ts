import Smooch from 'smooch';

export const zendeskGetConversation = async (
	odieChatId: number
): Promise< Conversation | undefined > => {
	if ( odieChatId ) {
		const existingConversation = Smooch.getConversations?.().find(
			( conversation: Conversation ) => {
				return conversation.metadata[ 'odieChatId' ] === odieChatId;
			}
		);

		if ( ! existingConversation ) {
			return;
		}

		const result = await Smooch.getConversationById( existingConversation.id );
		if ( result ) {
			Smooch.markAllAsRead( result.id );
			return result;
		}
	}

	return;
};
