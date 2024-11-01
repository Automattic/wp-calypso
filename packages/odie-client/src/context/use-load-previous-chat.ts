import { useEffect, useState } from 'react';
import { getZendeskConversation } from '../data/use-get-zendesk-conversation';
import { useOdieChat } from '../query/use-odie-chat';
import { Chat, OdieAllowedBots, Message, SupportProvider } from '../types/';
import { getOdieInitialMessage } from './get-odie-initial-message';

export const useLoadPreviousChat = ( {
	botNameSlug,
	odieInitialPromptText,
	setSupportProvider,
	isChatLoaded,
	selectedConversationId,
}: {
	botNameSlug: OdieAllowedBots;
	odieInitialPromptText?: string;
	setSupportProvider: ( supportProvider: SupportProvider ) => void;
	isChatLoaded: boolean;
	selectedConversationId?: string | null;
} ) => {
	const { chat: existingChat } = useOdieChat( 1, 30 );

	const [ chat, setChat ] = useState< Chat >( {
		chat_id: null,
		messages: [ getOdieInitialMessage( botNameSlug, odieInitialPromptText ) ],
	} );

	useEffect( () => {
		if ( existingChat || selectedConversationId ) {
			const initialMessage = getOdieInitialMessage( botNameSlug, odieInitialPromptText );
			const messages = [ initialMessage ];

			if ( existingChat ) {
				messages.push( ...( existingChat as Chat ).messages );
			}

			if ( isChatLoaded ) {
				getZendeskConversation( {
					chatId: existingChat?.chat_id,
					conversationId: selectedConversationId,
				} )?.then( ( conversation ) => {
					if ( conversation ) {
						setSupportProvider( 'zendesk' );
						setChat( {
							chat_id: conversation.metadata[ 'odieChatId' ]
								? Number( conversation.metadata[ 'odieChatId' ] )
								: null,
							...existingChat,
							conversationId: conversation.id,
							messages: [ ...messages, ...( conversation.messages as Message[] ) ],
						} );
					}
					return;
				} );
			}

			setChat( { ...existingChat, messages } );
		} else {
			setChat( {
				chat_id: null,
				messages: [ getOdieInitialMessage( botNameSlug, odieInitialPromptText ) ],
			} );
		}
	}, [
		botNameSlug,
		existingChat?.chat_id,
		odieInitialPromptText,
		setSupportProvider,
		isChatLoaded,
	] );

	return { chat };
};
