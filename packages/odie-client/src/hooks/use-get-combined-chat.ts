import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useEffect, useRef } from '@wordpress/element';
import { getOdieTransferMessage } from '../constants';
import { emptyChat } from '../context';
import { useGetZendeskConversation, useManageSupportInteraction, useOdieChat } from '../data';
import {
	getConversationIdFromInteraction,
	getOdieIdFromInteraction,
	getIsRequestingHumanSupport,
} from '../utils';
import type { Chat, Message } from '../types';
import { useSendZendeskMessage } from './use-send-zendesk-message';

/**
 * This combines the ODIE chat with the ZENDESK conversation.
 * @returns The combined chat.
 */
export const useGetCombinedChat = (
	canConnectToZendesk: boolean,
	isLoadingCanConnectToZendesk: boolean
) => {
	const {
		currentSupportInteraction,
		conversationId,
		odieId,
		isChatLoaded,
		connectionStatus,
		offlineQueue,
	} = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		const currentSupportInteraction = store.getCurrentSupportInteraction();
		const offlineQueue = store.getOfflineQueue();

		const odieId = getOdieIdFromInteraction( currentSupportInteraction );
		const conversationId = getConversationIdFromInteraction( currentSupportInteraction );

		return {
			currentSupportInteraction,
			conversationId,
			odieId,
			offlineQueue,
			isChatLoaded: store.getIsChatLoaded(),
			connectionStatus: store.getZendeskConnectionStatus(),
		};
	}, [] );
	const previousUuidRef = useRef< string | undefined >();
	const [ mainChatState, setMainChatState ] = useState< Chat >( emptyChat );
	const { setOfflineQueue } = useDispatch( HELP_CENTER_STORE );
	const chatStatus = mainChatState?.status;
	const getZendeskConversation = useGetZendeskConversation();
	const sendZendeskMessage = useSendZendeskMessage();
	const { data: odieChat, status: odieChatStatus } = useOdieChat( Number( odieId ) );
	const { startNewInteraction } = useManageSupportInteraction();

	useEffect( () => {
		if ( connectionStatus === 'connected' ) {
			if ( offlineQueue.length > 0 ) {
				offlineQueue.forEach( ( message ) => sendZendeskMessage( message, false ) );
				setOfflineQueue( [] );
			}
			setTimeout( () => {
				setMainChatState( ( chat ) => ( {
					...chat,
					status: 'loading',
				} ) );
				// Reset the previous uuid to refetch the messages that were lost while offline.
				previousUuidRef.current = '';
				// Give a buffer for ZD to warm up before re-fetching the lost messages.
			}, 2000 );
		}
	}, [ connectionStatus, offlineQueue, setOfflineQueue ] );

	useEffect( () => {
		const interactionHasChanged = previousUuidRef.current !== currentSupportInteraction?.uuid;
		if (
			! currentSupportInteraction?.uuid ||
			odieChatStatus !== 'success' ||
			isLoadingCanConnectToZendesk ||
			( chatStatus !== 'loading' && ! interactionHasChanged )
		) {
			return;
		}

		previousUuidRef.current = currentSupportInteraction?.uuid;

		// We don't have a conversation id, so our chat is simply the odie chat
		if ( ! conversationId ) {
			setMainChatState( {
				...( odieChat ? odieChat : emptyChat ),
				conversationId: null,
				supportInteractionId: currentSupportInteraction.uuid,
				status: 'loaded',
				provider: 'odie',
			} );
			return;
		}

		const filteredOdieMessages =
			odieChat?.messages.filter( ( message ) => ! getIsRequestingHumanSupport( message ) ) ?? [];

		// We have an ongoing conversation with Zendesk, but we have some problems connecting to it
		if ( ! canConnectToZendesk ) {
			setMainChatState( {
				messages: [ ...( odieChat ? filteredOdieMessages : [] ) ],
				conversationId,
				supportInteractionId: currentSupportInteraction.uuid,
				status: 'loaded',
				provider: 'zendesk',
			} );
			return;
		}

		if ( isChatLoaded ) {
			try {
				getZendeskConversation( {
					chatId: odieChat?.odieId,
					conversationId: conversationId?.toString(),
				} )?.then( ( conversation ) => {
					if ( conversation ) {
						setMainChatState( {
							...( odieChat ? odieChat : {} ),
							supportInteractionId: currentSupportInteraction.uuid,
							conversationId: conversation.id,
							messages: [
								...( odieChat ? filteredOdieMessages : [] ),
								...( odieChat ? getOdieTransferMessage() : [] ),
								...( conversation.messages as Message[] ),
							],
							provider: 'zendesk',
							status: currentSupportInteraction.status === 'closed' ? 'closed' : 'loaded',
						} );
					}
				} );
			} catch ( error ) {
				recordTracksEvent( 'calypso_odie_zendesk_conversation_not_found', {
					conversation_id: conversationId,
					odie_id: odieId,
					error: error instanceof Error ? error.message : String( error ),
				} );

				startNewInteraction( {
					event_source: 'help-center',
					event_external_id: crypto.randomUUID(),
				} );
			}
		}
	}, [
		odieChatStatus,
		chatStatus,
		isChatLoaded,
		odieChat,
		conversationId,
		odieId,
		currentSupportInteraction,
		canConnectToZendesk,
		getZendeskConversation,
		startNewInteraction,
		isLoadingCanConnectToZendesk,
	] );

	return { mainChatState, setMainChatState };
};
