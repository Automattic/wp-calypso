import { useEffect, useState } from 'react';
import { useOdieGetChat } from '../query';
import { Chat, OdieAllowedBots } from '../types/';
import { transformMessages } from '../utils/conversation-utils';
import { getOdieInitialMessage } from './get-odie-initial-message';

export const useLoadPreviousChat = (
	botNameSlug: OdieAllowedBots,
	chatId: number | null | undefined,
	getConversation: ( chatId?: number | null ) => Promise< any >,
	canLoad: boolean
) => {
	const { data: existingChat } = useOdieGetChat( botNameSlug, chatId, 1, 30 );
	const [ chat, setChat ] = useState< Chat >( {
		chat_id: null,
		type: 'ai',
		messages: [ getOdieInitialMessage( botNameSlug ) ],
		loading: true,
	} );

	useEffect( () => {
		const loadConversation = async () => {
			if ( existingChat ) {
				const initialMessage = getOdieInitialMessage( botNameSlug );
				const conversation = await getConversation( existingChat.chat_id );
				const conversationMessages = transformMessages( conversation?.messages || [] );
				const messages = [ initialMessage, ...existingChat.messages, ...conversationMessages ];
				setChat( {
					...existingChat,
					messages,
					type: conversation ? 'human' : 'ai',
					loading: false,
				} );
			} else {
				setChat( {
					chat_id: null,
					type: 'ai',
					messages: [ getOdieInitialMessage( botNameSlug ) ],
					loading: false,
				} );
			}
		};
		if ( canLoad ) {
			loadConversation();
		}
	}, [ botNameSlug, chatId, existingChat, getConversation, canLoad ] );

	return chat;
};
