import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { ODIE_TRANSFER_MESSAGE } from '../constants';
import { emptyChat } from '../context';
import { useGetZendeskConversation, useOdieChat } from '../data';
import type { Chat, Message } from '../types';

/**
 * This combines the ODIE chat with the ZENDESK conversation.
 * @returns The combined chat.
 */
export const useGetCombinedChat = ( canConnectToZendesk: boolean ) => {
	const { currentSupportInteraction, conversationId, odieId, isChatLoaded } = useSelect(
		( select ) => {
			const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
			const currentSupportInteraction = store.getCurrentSupportInteraction();

			// Get the current odie chat ID
			const odieId =
				currentSupportInteraction?.events.find( ( event ) => event.event_source === 'odie' )
					?.event_external_id ?? null;

			// Get the current Zendesk conversation ID
			const conversationId =
				currentSupportInteraction?.events.find( ( event ) => event.event_source === 'zendesk' )
					?.event_external_id ?? null;

			return {
				currentSupportInteraction,
				conversationId,
				odieId,
				isChatLoaded: store.getIsChatLoaded(),
			};
		},
		[]
	);

	const [ mainChatState, setMainChatState ] = useState< Chat >( emptyChat );
	const getZendeskConversation = useGetZendeskConversation();

	const { data: odieChat, isLoading: isOdieChatLoading } = useOdieChat( Number( odieId ) );

	useEffect( () => {
		if ( odieId && odieChat && ! conversationId ) {
			setMainChatState( {
				...odieChat,
				provider: 'odie',
				conversationId: null,
				supportInteractionId: currentSupportInteraction!.uuid,
				status: 'loaded',
			} );
		} else if ( conversationId && canConnectToZendesk ) {
			if ( isChatLoaded ) {
				getZendeskConversation( {
					chatId: odieChat?.odieId,
					conversationId: conversationId.toString(),
				} )?.then( ( conversation ) => {
					if ( conversation ) {
						setMainChatState( {
							...( odieChat ? odieChat : {} ),
							supportInteractionId: currentSupportInteraction!.uuid,
							conversationId: conversation.id,
							messages: [
								...( odieChat ? odieChat.messages : [] ),
								...( odieChat ? ODIE_TRANSFER_MESSAGE : [] ),
								...( conversation.messages as Message[] ),
							],
							provider: 'zendesk',
							status: currentSupportInteraction?.status === 'closed' ? 'closed' : 'loaded',
						} );
					}
				} );
			}
		} else if ( currentSupportInteraction ) {
			setMainChatState( ( prevChat ) => ( {
				...( prevChat.supportInteractionId !== currentSupportInteraction!.uuid
					? emptyChat
					: prevChat ),
				supportInteractionId: currentSupportInteraction!.uuid,
				status: 'loaded',
			} ) );
		}
	}, [
		isOdieChatLoading,
		isChatLoaded,
		odieChat,
		conversationId,
		odieId,
		currentSupportInteraction,
		canConnectToZendesk,
		getZendeskConversation,
	] );

	return { mainChatState, setMainChatState };
};
