import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { getOdieTransferMessageConstant } from '../constants';
import { emptyChat } from '../context';
import { getZendeskConversation, useOdieChat } from '../data';
import type { Chat, ChatStatus, Message } from '../types';

/**
 * This combines the ODIE chat with the ZENDESK conversation.
 * @returns The combined chat.
 */
export const useGetCombinedChat = (
	canConnectToZendesk: boolean,
	shouldUseHelpCenterExperience: boolean | undefined
) => {
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
	const { data: odieChat, isLoading: isOdieChatLoading } = useOdieChat( Number( odieId ) );

	useEffect( () => {
		if ( ! odieId && ! conversationId ) {
			return;
		}

		/**
		 * Odie only chat
		 */
		if (
			! isOdieChatLoading &&
			odieChat &&
			( ! shouldUseHelpCenterExperience || ! conversationId )
		) {
			setMainChatState( {
				...odieChat,
				provider: 'odie',
				conversationId: null,
				supportInteractionId: currentSupportInteraction!.uuid,
				status: 'loaded',
			} );
		}

		if ( conversationId && canConnectToZendesk && isChatLoaded ) {
			/**
			 * Zendesk only chat
			 */
			if ( ! odieId ) {
				getZendeskConversation( { conversationId } )?.then( ( conversation ) => {
					if ( conversation ) {
						setMainChatState( {
							odieId: null,
							wpcomUserId: null,
							supportInteractionId: currentSupportInteraction!.uuid,
							conversationId: conversation.id,
							messages: conversation.messages,
							provider: 'zendesk',
							status: ( currentSupportInteraction?.status === 'closed'
								? 'closed'
								: 'loaded' ) as ChatStatus,
						} );
					}
				} );
			}

			/**
			 * Unified chat
			 */
			if ( ! isOdieChatLoading && odieChat ) {
				getZendeskConversation( { conversationId } )?.then( ( conversation ) => {
					if ( conversation ) {
						setMainChatState( {
							...odieChat,
							supportInteractionId: currentSupportInteraction!.uuid,
							conversationId: conversation.id,
							messages: [
								...odieChat.messages,
								...getOdieTransferMessageConstant( true ),
								...( conversation.messages as Message[] ),
							],
							provider: 'zendesk',
							status: ( currentSupportInteraction?.status === 'closed'
								? 'closed'
								: 'loaded' ) as ChatStatus,
						} );
					}
				} );
			}
		}
	}, [
		canConnectToZendesk,
		shouldUseHelpCenterExperience,
		isChatLoaded,
		isOdieChatLoading,
		odieId,
		odieChat,
		conversationId,
		currentSupportInteraction,
	] );

	return { mainChatState, setMainChatState };
};
