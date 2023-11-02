import { useEffect, useState } from 'react';
import { useOdieGetChat } from '../query';
import { Chat, OdieAllowedBots } from '../types';
import { getOdieInitialMessage } from './get-odie-initial-message';

export const useLoadPreviousChat = (
	botNameSlug: OdieAllowedBots,
	chatId: number | null | undefined
) => {
	const { data: existingChat } = useOdieGetChat( botNameSlug, chatId );
	const [ chat, setChat ] = useState< Chat >( {
		chat_id: null,
		messages: [ getOdieInitialMessage( botNameSlug ) ],
	} );
	useEffect( () => {
		if ( existingChat ) {
			const initialMessage = getOdieInitialMessage( botNameSlug );
			const messages = [ initialMessage, ...existingChat.messages ];
			setChat( { ...existingChat, messages } );
		} else {
			setChat( {
				chat_id: null,
				messages: [ getOdieInitialMessage( botNameSlug ) ],
			} );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ botNameSlug, chatId ] );

	return chat;
};
