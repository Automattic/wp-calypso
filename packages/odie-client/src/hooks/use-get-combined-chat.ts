import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useIsMutating } from '@tanstack/react-query';
import { useSelect } from '@wordpress/data';
import { useState, useEffect, useRef } from '@wordpress/element';
import Smooch from 'smooch';
import { getMessageUniqueIdentifier } from '../components/message/utils/get-message-unique-identifier';
import { getOdieTransferMessage } from '../constants';
import { emptyChat } from '../context';
import { useGetZendeskConversation, useManageSupportInteraction, useOdieChat } from '../data';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';
import {
	getConversationIdFromInteraction,
	getOdieIdFromInteraction,
	getIsRequestingHumanSupport,
} from '../utils';
import type { Chat, Message, OdieAllBotSlugs } from '../types';

function isEqual( message1: Message, message2: Message ) {
	const message1Id = getMessageUniqueIdentifier( message1 );
	const message2Id = getMessageUniqueIdentifier( message2 );
	return message1Id && message1Id === message2Id;
}

/**
 * Deduplicate Zendesk messages by their temporary id. During connection recovery, some duplication can occur.
 * @param messages - The messages to deduplicate.
 * @returns The deduplicated messages.
 */
export function deduplicateZDMessages( messages: Message[] ) {
	const distinctMessages: Message[] = [];
	for ( const message of messages ) {
		if ( ! distinctMessages.some( ( otherMessage ) => isEqual( message, otherMessage ) ) ) {
			distinctMessages.push( message );
		}
	}
	return distinctMessages;
}

/**
 * This combines the ODIE chat with the ZENDESK conversation.
 * @returns The combined chat.
 */
export const useGetCombinedChat = (
	canConnectToZendesk: boolean,
	isLoadingCanConnectToZendesk: boolean
) => {
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const odieId = getOdieIdFromInteraction( currentSupportInteraction );

	const { isChatLoaded, connectionStatus } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;

		return {
			isChatLoaded: store.getIsChatLoaded(),
			connectionStatus: store.getZendeskConnectionStatus(),
		};
	}, [] );
	const previousUuidRef = useRef< string | undefined >();
	const [ mainChatState, setMainChatState ] = useState< Chat >( emptyChat );
	const conversationId = getConversationIdFromInteraction( currentSupportInteraction );
	const [ refreshingAfterReconnect, setRefreshingAfterReconnect ] = useState( false );
	const chatStatus = mainChatState?.status;
	const getZendeskConversation = useGetZendeskConversation();
	const { data: odieChat, isFetching: isOdieChatLoading } = useOdieChat( Number( odieId ) );
	const { startNewInteraction } = useManageSupportInteraction();
	const isUploadingUnsentMessages = useIsMutating( {
		mutationKey: [ 'send-zendesk-messages' ],
	} );

	useEffect( () => {
		if ( connectionStatus === 'connected' ) {
			setRefreshingAfterReconnect( true );
			setMainChatState( ( chat ) => ( {
				...chat,
				status: 'loading',
			} ) );
		}
	}, [ connectionStatus, setRefreshingAfterReconnect ] );

	useEffect( () => {
		const interactionHasChanged = previousUuidRef.current !== currentSupportInteraction?.uuid;
		if (
			! currentSupportInteraction?.uuid ||
			isOdieChatLoading ||
			isUploadingUnsentMessages ||
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

		if ( isChatLoaded || refreshingAfterReconnect ) {
			try {
				getZendeskConversation( {
					chatId: odieChat?.odieId,
					conversationId: conversationId?.toString(),
				} )?.then( ( conversation ) => {
					if ( conversation ) {
						// We need to load the conversation to get typing events. Load simply means "focus on".
						Smooch.loadConversation( conversation.id );
						setMainChatState( ( mainChatState ) => {
							const isSameConversation =
								mainChatState.odieId?.toString() === odieId?.toString() &&
								mainChatState.conversationId === conversation.id;

							return {
								...( odieChat ? odieChat : {} ),
								supportInteractionId: currentSupportInteraction.uuid,
								conversationId: conversation.id,
								messages: [
									...( odieChat ? filteredOdieMessages : [] ),
									...( odieChat
										? getOdieTransferMessage(
												currentSupportInteraction.bot_slug as OdieAllBotSlugs
										  )
										: [] ),
									...( deduplicateZDMessages( [
										// During connection recovery, the user queued messages can be deleted. This ensure they remain. And `deduplicateZDMessages` takes of duplication.
										...( isSameConversation
											? mainChatState.messages.filter( ( message ) => message.role === 'user' )
											: [] ),
										...conversation.messages,
									] ) as Message[] ),
								],
								provider: 'zendesk',
								status: currentSupportInteraction.status === 'closed' ? 'closed' : 'loaded',
							};
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
			} finally {
				setRefreshingAfterReconnect( false );
			}
		}
	}, [
		isOdieChatLoading,
		chatStatus,
		refreshingAfterReconnect,
		isUploadingUnsentMessages,
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
