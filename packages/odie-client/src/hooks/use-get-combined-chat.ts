import { useState, useEffect } from '@wordpress/element';
import { emptyChat } from '../context';
import { getZendeskConversation, useOdieChat } from '../data';
import type { Chat, Message, SupportInteraction } from '../types';

/**
 * This combines the ODIE chat with the ZENDESK conversation.
 * @param currentSupportInteraction - The current support interaction.
 * @returns The combined chat.
 */
export const useGetCombinedChat = ( currentSupportInteraction?: SupportInteraction ) => {
	const [ chat, setChat ] = useState< Chat >( {
		...emptyChat,
		status: 'loading',
		supportInteractionId: currentSupportInteraction?.uuid ?? null,
	} );

	// Get the current odie chat
	const odieId =
		currentSupportInteraction?.events.find( ( event ) => event.event_source === 'odie' )
			?.event_external_id ?? null;

	// Get the current Zendesk conversation ID
	const conversationId = currentSupportInteraction?.events.find(
		( event ) => event.event_source === 'zendesk'
	)?.event_external_id;

	const {
		data: odieChat,
		isLoading: isOdieChatLoading,
		refetch: refetchOdieChat,
	} = useOdieChat( Number( odieId ) );

	useEffect( () => {
		// TODO: I am not sure how to approach this...
		if ( ! isOdieChatLoading && odieId && ! chat.odieId ) {
			refetchOdieChat().then( () => {
				if ( odieChat ) {
					setChat( odieChat );
				}
			} );
		}

		if ( ! isOdieChatLoading && conversationId ) {
			getZendeskConversation( {
				chatId: chat.odieId,
				conversationId: conversationId.toString(),
			} )?.then( ( conversation ) => {
				if ( conversation ) {
					setChat( ( prevChat ) => ( {
						...prevChat,
						conversationId: conversation.id,
						messages: [ ...prevChat.messages, ...( conversation.messages as Message[] ) ],
					} ) );
				}
			} );
		}
	}, [
		chat.odieId,
		isOdieChatLoading,
		odieChat,
		conversationId,
		refetchOdieChat,
		odieId,
		currentSupportInteraction,
	] );

	return chat;
};
