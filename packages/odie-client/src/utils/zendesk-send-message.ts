import Smooch from 'smooch';

export const zendeskSendMessage: (
	message: string,
	chatId?: number | null
) => void | Promise< any > = ( message: string, chatId?: number | null ) => {
	if ( chatId ) {
		const conversation = Smooch.getConversations().find( ( conversation ) => {
			return Number( conversation.metadata[ 'odieChatId' ] ) === chatId;
		} );

		if ( ! conversation ) {
			return;
		}

		return Smooch.sendMessage( { type: 'text', text: message }, conversation.id );
	}
};
