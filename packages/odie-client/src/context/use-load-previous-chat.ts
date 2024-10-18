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
}: {
	botNameSlug: OdieAllowedBots;
	odieInitialPromptText?: string;
	setSupportProvider: ( supportProvider: SupportProvider ) => void;
	isChatLoaded: boolean;
} ) => {
	const { chat: existingChat } = useOdieChat( 1, 30 );

	const [ chat, setChat ] = useState< Chat >( {
		chat_id: null,
		messages: [ getOdieInitialMessage( botNameSlug, odieInitialPromptText ) ],
	} );

	useEffect( () => {
		if ( existingChat ) {
			const initialMessage = getOdieInitialMessage( botNameSlug, odieInitialPromptText );
			let messages = [ initialMessage, ...( existingChat as Chat ).messages ];

			const conversation = isChatLoaded && getZendeskConversation( existingChat.chat_id );
			if ( conversation ) {
				setSupportProvider( 'zendesk' );
				messages = [ ...messages, ...( conversation.messages as Message[] ) ];
				existingChat.conversationId = conversation.id;
			}

			setChat( { ...existingChat, messages } );
		} else {
			setChat( {
				chat_id: null,
				messages: [ getOdieInitialMessage( botNameSlug, odieInitialPromptText ) ],
			} );
		}
	}, [ botNameSlug, existingChat, odieInitialPromptText, setSupportProvider, isChatLoaded ] );

	return { chat };
};
