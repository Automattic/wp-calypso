import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenterSelect } from '@automattic/data-stores';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useIsMutating } from '@tanstack/react-query';
import { useSelect } from '@wordpress/data';
import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import { getMessageUniqueIdentifier } from '../components/message/utils/get-message-unique-identifier';
import {
	HELP_CENTER_STORE,
	getOdieTransferMessages,
	getZendeskChatStartedMetaMessage,
} from '../constants';
import { emptyChat } from '../context';
import { useGetZendeskConversation, useManageSupportInteraction, useOdieChat } from '../data';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';
import {
	getConversationIdFromInteraction,
	getOdieIdFromInteraction,
	getIsRequestingHumanSupport,
} from '../utils';
import { useLoggedOutSession } from './use-logged-out-session';
import type { Chat, Message } from '../types';

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
	const { data: currentSupportInteraction, isLoading: isLoadingCurrentSupportInteraction } =
		useCurrentSupportInteraction();

	const { loggedOutOdieChatId, sessionId, botSlug } = useLoggedOutSession();
	const hasEnTranslation = useHasEnTranslation();

	const odieId = loggedOutOdieChatId || getOdieIdFromInteraction( currentSupportInteraction );
	const { isChatLoaded, connectionStatus } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;

		return {
			isChatLoaded: store.getIsChatLoaded(),
			connectionStatus: store.getZendeskConnectionStatus(),
		};
	}, [] );
	const previousUuidRef = useRef< string | undefined >( undefined );
	const previousOdieIdRef = useRef< string | null | undefined >( undefined );
	const wasChatLoadedRef = useRef( isChatLoaded );
	const [ mainChatState, setMainChatState ] = useState< Chat >( emptyChat );
	const conversationId = getConversationIdFromInteraction( currentSupportInteraction );
	const [ refreshingAfterReconnect, setRefreshingAfterReconnect ] = useState( false );
	const chatStatus = mainChatState?.status;
	const getZendeskConversation = useGetZendeskConversation();
	const { data: odieChat, isFetching: isOdieChatLoading } = useOdieChat(
		Number( odieId ),
		sessionId,
		botSlug
	);
	const [ isFetchingConversation, setIsFetchingConversation ] = useState( false );

	const { startNewInteraction } = useManageSupportInteraction();
	const isUploadingUnsentMessages = useIsMutating( {
		mutationKey: [ 'send-zendesk-messages' ],
	} );

	// Re-download the active Zendesk conversation and merge it into the chat.
	// The merge in the main effect dedupes and preserves the user's queued
	// messages, so it is safe to call whenever we may have missed live messages.
	const refreshConversation = useCallback( () => {
		setRefreshingAfterReconnect( true );
		setMainChatState( ( chat ) => ( {
			...chat,
			status: 'loading',
		} ) );
	}, [ setRefreshingAfterReconnect ] );

	// Recover messages missed while the connection was dropped: once Smooch
	// reports it has reconnected, re-fetch the conversation.
	useEffect( () => {
		if ( connectionStatus === 'connected' ) {
			refreshConversation();
		}
	}, [ connectionStatus, refreshConversation ] );

	// Recover messages missed during a Smooch re-initialization. When Smooch is
	// re-initialized, `isChatLoaded` flips false → true (it is set false right
	// before `Smooch.destroy()` and true once `Smooch.init()` resolves). The
	// WebSocket is down for that whole window, so any agent messages that arrive
	// are never delivered through `message:received`. The connection-recovery
	// effect only calls `refreshConversation` after a prior disconnect
	// (`connectionStatus === 'connected'`), so a React-driven re-init would
	// otherwise silently drop them — refresh here to recover the gap.
	useEffect( () => {
		const isReinitialized = ! wasChatLoadedRef.current && isChatLoaded;
		wasChatLoadedRef.current = isChatLoaded;

		if ( isReinitialized && conversationId ) {
			refreshConversation();
		}
	}, [ isChatLoaded, conversationId, refreshConversation ] );

	useEffect( () => {
		// Logged out chats don't have interactions. Only direct odie IDs.
		const interactionHasChanged =
			previousUuidRef.current !== currentSupportInteraction?.uuid ||
			// If the ID has changed from something to something else, we need to clear the chat.
			// If the ID changed from nothing to something, we need to ignore the change, because
			// it's just a transition from an empty chat to a new one after the first message.
			( previousOdieIdRef.current && previousOdieIdRef.current !== odieId ) ||
			// Check if the current chat state matches the URL's odieId.
			// This handles back navigation where we navigate from a new chat (no odieId)
			// to an existing chat (with odieId). In this case, previousOdieIdRef was undefined
			// so interactionHasChanged is false, but we still need to reload the chat.
			mainChatState.odieId?.toString() !== odieId?.toString();

		previousOdieIdRef.current = odieId;

		if (
			( isOdieChatLoading && ! interactionHasChanged ) ||
			isLoadingCurrentSupportInteraction ||
			isFetchingConversation ||
			isUploadingUnsentMessages ||
			isLoadingCanConnectToZendesk ||
			( chatStatus !== 'loading' && ! interactionHasChanged )
		) {
			return;
		}

		previousUuidRef.current = currentSupportInteraction?.uuid;

		const supportInteractionId = currentSupportInteraction?.uuid ?? null;

		// We don't have a conversation id, so our chat is simply the odie chat
		if ( ! conversationId ) {
			const shouldLoadOdieChat =
				odieChat &&
				( chatStatus === 'loading' || interactionHasChanged || ! mainChatState.messages.length );

			// set chat empty state or with messages
			if ( ! currentSupportInteraction?.uuid || shouldLoadOdieChat ) {
				setMainChatState( {
					...( shouldLoadOdieChat ? odieChat : emptyChat ),
					conversationId: null,
					status: 'loaded',
					provider: 'odie',
				} );
			}
			return;
		}

		const filteredOdieMessages =
			odieChat?.messages.filter( ( message ) => ! getIsRequestingHumanSupport( message ) ) ?? [];

		// We have an ongoing conversation with Zendesk, but we have some problems connecting to it
		if ( ! canConnectToZendesk ) {
			setMainChatState( {
				messages: [ ...( odieChat ? filteredOdieMessages : [] ) ],
				conversationId,
				status: 'loaded',
				provider: 'zendesk',
			} );
			return;
		}

		if ( conversationId && ( isChatLoaded || refreshingAfterReconnect ) ) {
			setIsFetchingConversation( true );
			getZendeskConversation( conversationId )
				?.then( ( conversation ) => {
					if ( conversation ) {
						setMainChatState( ( prevChat ) => {
							const isSameConversation =
								prevChat.odieId?.toString() === odieId?.toString() &&
								prevChat.conversationId === conversation.id;

							return {
								odieId: odieId ? Number( odieId ) : null,
								wpcomUserId: odieChat?.wpcomUserId || prevChat.wpcomUserId,
								supportInteractionId,
								conversationId: conversation.id,
								messages: [
									...( odieChat ? filteredOdieMessages : [] ),
									...getOdieTransferMessages(
										currentSupportInteraction?.bot_slug,
										hasEnTranslation
									),
									getZendeskChatStartedMetaMessage(),
									...( deduplicateZDMessages( [
										// During connection recovery, the user queued messages can be deleted. This ensure they remain. And `deduplicateZDMessages` takes of duplication.
										...( isSameConversation
											? prevChat.messages.filter( ( message ) => message.role === 'user' )
											: [] ),
										...conversation.messages,
									] ) as Message[] ),
								],
								provider: 'zendesk',
								status: currentSupportInteraction?.status === 'closed' ? 'closed' : 'loaded',
							};
						} );
					}
				} )
				.catch( ( error ) => {
					recordTracksEvent( 'calypso_odie_zendesk_conversation_not_found', {
						conversation_id: conversationId,
						odie_id: odieId,
						error: error instanceof Error ? error.message : String( error ),
					} );

					startNewInteraction( {
						event_source: 'odie',
						event_external_id: crypto.randomUUID(),
					} );
				} )
				.finally( () => {
					setRefreshingAfterReconnect( false );
					setIsFetchingConversation( false );
				} );
		}
	}, [
		isOdieChatLoading,
		chatStatus,
		refreshingAfterReconnect,
		isUploadingUnsentMessages,
		isChatLoaded,
		isFetchingConversation,
		conversationId,
		odieId,
		currentSupportInteraction,
		canConnectToZendesk,
		getZendeskConversation,
		startNewInteraction,
		isLoadingCanConnectToZendesk,
		sessionId,
		botSlug,
		isLoadingCurrentSupportInteraction,
		hasEnTranslation,
		mainChatState?.messages?.length,
		mainChatState?.odieId,
		odieChat,
	] );

	return { mainChatState, setMainChatState };
};
