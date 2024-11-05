import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { useOdieAssistantContext } from '../context';
import { getZendeskConversation } from '../data/use-get-zendesk-conversation';
import { useOdieChat } from './use-odie-chat';
import type { Chat, Message } from '../types/';
import type { SetStateAction } from 'react';

export const useChat = () => {
	const { setSupportProvider, setChatStatus } = useOdieAssistantContext();

	// Get the current support interaction
	const { currentSupportInteraction } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
		};
	}, [] );

	// Get the current odie chat
	const { chat: odieChat } = useOdieChat();

	// Get the current Zendesk conversation ID
	const currentZendeskConversationId = currentSupportInteraction?.events.find(
		( event ) => event.source === 'zendesk'
	)?.event_external_id;

	// Create the current chat state
	const [ currentChat, setCurrentChat ] = useState< Chat >( odieChat );

	// If there is a current Zendesk conversation ID, get the conversation and update the chat state
	if ( currentZendeskConversationId ) {
		getZendeskConversation( {
			chatId: odieChat?.chat_id,
			conversationId: currentZendeskConversationId.toString(),
		} )?.then( ( conversation ) => {
			if ( conversation ) {
				setSupportProvider( 'zendesk' );
				setCurrentChat( {
					chat_id: odieChat.chat_id,
					conversationId: conversation.id,
					messages: [ ...odieChat.messages, ...( conversation.messages as Message[] ) ],
				} );
			}
			setChatStatus( 'loaded' );
			return;
		} );
	}

	const addMessageToChatArray = ( messages: Message | Message[] ) => {
		setCurrentChat( ( prevChat ) => {
			return {
				...prevChat,
				messages: [
					...prevChat.messages,
					...( Array.isArray( messages ) ? messages : [ messages ] ),
				],
			};
		} );
	};

	const updateMessageInChatArray = ( callback: SetStateAction< Chat > ) => {
		setCurrentChat( callback );
	};

	return { currentChat, addMessageToChatArray, updateMessageInChatArray };
};
