import { useEffect, useState } from 'react';
import { getZendeskConversation } from '../data/use-get-zendesk-conversation';
import { useOdieChat } from '../query/use-odie-chat';
import { Chat, OdieAllowedBots, Message, SupportProvider } from '../types/';
import { getOdieInitialMessage } from './get-odie-initial-message';
import { useOdieAssistantContext } from '.';

export const useLoadPreviousChat = ( {
	botNameSlug,
	odieInitialPromptText,
	setSupportProvider,
	isChatLoaded,
	selectedConversationId,
	setChatStatus,
}: {
	botNameSlug: OdieAllowedBots;
	odieInitialPromptText?: string;
	setSupportProvider: ( supportProvider: SupportProvider ) => void;
	isChatLoaded: boolean;
	selectedConversationId?: string | null;
	setChatStatus: ( chatStatus: 'loading' | 'loaded' | 'sending' | 'dislike' | 'transfer' ) => void;
} ) => {
	const { chat: existingChat } = useOdieChat( 1, 30 );
	const { shouldUseHelpCenterExperience } = useOdieAssistantContext();

	const [ chat, setChat ] = useState< Chat >( {
		chat_id: null,
		messages: [
			getOdieInitialMessage( botNameSlug, odieInitialPromptText, shouldUseHelpCenterExperience ),
		],
	} );

	useEffect( () => {
		if ( existingChat || selectedConversationId ) {
			const initialMessage = getOdieInitialMessage(
				botNameSlug,
				odieInitialPromptText,
				shouldUseHelpCenterExperience
			);
			const messages = [ initialMessage ];

			if ( existingChat ) {
				messages.push( ...( existingChat as Chat ).messages );
			}

			if ( selectedConversationId && isChatLoaded ) {
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
					setChatStatus( 'loaded' );
					return;
				} );
			} else {
				setChat( { ...existingChat, messages } );
				setChatStatus( 'loaded' );
			}
		} else {
			setChat( {
				chat_id: null,
				messages: [
					getOdieInitialMessage(
						botNameSlug,
						odieInitialPromptText,
						shouldUseHelpCenterExperience
					),
				],
			} );
			setChatStatus( 'loaded' );
		}
	}, [
		botNameSlug,
		existingChat?.chat_id,
		odieInitialPromptText,
		setSupportProvider,
		isChatLoaded,
		setChatStatus,
		existingChat,
		selectedConversationId,
		shouldUseHelpCenterExperience,
	] );

	return { chat };
};
