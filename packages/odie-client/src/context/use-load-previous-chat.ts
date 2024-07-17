import { useHelpCenterMessenger } from '@automattic/help-center/src/components/help-center-messenger';
import { useEffect, useState } from 'react';
import { useOdieGetChat } from '../query';
import { Chat, OdieAllowedBots } from '../types/';
import { ODIE_CHAT_KEY, translateMessages } from '../utils/conversation-utils';
import { getOdieInitialMessage } from './get-odie-initial-message';

export const useLoadPreviousChat = (
	botNameSlug: OdieAllowedBots,
	chatId: number | null | undefined
) => {
	const { getConversations } = useHelpCenterMessenger();
	const { data: existingChat } = useOdieGetChat( botNameSlug, chatId, 1, 30 );
	const [ chat, setChat ] = useState< Chat >( {
		chat_id: null,
		type: 'ai',
		messages: [ getOdieInitialMessage( botNameSlug ) ],
	} );
	useEffect( () => {
		if ( existingChat ) {
			const initialMessage = getOdieInitialMessage( botNameSlug );
			const conversation = getConversations().find(
				( conversation ) => conversation.metadata[ ODIE_CHAT_KEY ] === chatId
			);
			const conversationMessages = translateMessages( conversation?.messages || [] );
			const messages = [ initialMessage, ...existingChat.messages, ...conversationMessages ];
			setChat( { ...existingChat, messages, type: conversation ? 'human' : 'ai' } );
		} else {
			setChat( {
				chat_id: null,
				type: 'ai',
				messages: [ getOdieInitialMessage( botNameSlug ) ],
			} );
		}
	}, [ botNameSlug, chatId, existingChat, getConversations ] );

	return chat;
};
