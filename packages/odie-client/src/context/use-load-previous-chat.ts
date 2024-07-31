import { useEffect, useState } from 'react';
import { useOdieGetChat } from '../query';
import { Chat, OdieAllowedBots } from '../types/';
import { getOdieInitialMessage } from './get-odie-initial-message';

export const useLoadPreviousChat = ( {
	botNameSlug,
	chatId,
	odieInitialPromptText,
}: {
	botNameSlug: OdieAllowedBots;
	chatId: number | null | undefined;
	odieInitialPromptText?: string;
} ) => {
	const { data: existingChat } = useOdieGetChat( botNameSlug, chatId, 1, 30 );

	const [ chat, setChat ] = useState< Chat >( {
		chat_id: null,
		messages: [ getOdieInitialMessage( botNameSlug, odieInitialPromptText ) ],
	} );
	useEffect( () => {
		if ( existingChat ) {
			const initialMessage = getOdieInitialMessage( botNameSlug, odieInitialPromptText );
			const messages = [ initialMessage, ...existingChat.messages ];
			setChat( { ...existingChat, messages } );
		} else {
			setChat( {
				chat_id: null,
				messages: [ getOdieInitialMessage( botNameSlug, odieInitialPromptText ) ],
			} );
		}
	}, [ botNameSlug, chatId, existingChat, odieInitialPromptText ] );

	return chat;
};
