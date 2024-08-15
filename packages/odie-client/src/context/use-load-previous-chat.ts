import { useSmooch } from '@automattic/zendesk-client';
import { useEffect, useState } from 'react';
import { useOdieGetChat } from '../query';
import { Chat, OdieAllowedBots } from '../types/';
import { transformMessages } from '../utils/conversation-utils';
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
	const { data: existingChat, isLoading: loadingChat } = useOdieGetChat(
		botNameSlug,
		chatId,
		1,
		30
	);
	const { init: shouldLoadConversation, getConversation } = useSmooch();
	const [ chat, setChat ] = useState< Chat >( {
		chat_id: null,
		type: 'ai',
		messages: [ getOdieInitialMessage( botNameSlug, odieInitialPromptText ) ],
	} );

	useEffect( () => {
		if ( ! shouldLoadConversation ) {
			setChat( ( currentChat ) => ( {
				...currentChat,
				loading: false,
			} ) );
		}
	}, [ shouldLoadConversation ] );

	const [ isLoading, setIsLoading ] = useState( true );

	useEffect( () => {
		setIsLoading( loadingChat );
		const loadConversation = async () => {
			if ( existingChat?.chat_id ) {
				const initialMessage = getOdieInitialMessage( botNameSlug, odieInitialPromptText );
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
					messages: [ getOdieInitialMessage( botNameSlug, odieInitialPromptText ) ],
					loading: false,
				} );
			}
		};
		if ( shouldLoadConversation ) {
			setChat( ( currentChat ) => ( {
				...currentChat,
				loading: true,
			} ) );
			loadConversation();
		}
	}, [
		botNameSlug,
		chatId,
		existingChat,
		shouldLoadConversation,
		loadingChat,
		odieInitialPromptText,
	] );

	return { chat, isLoading };
};
