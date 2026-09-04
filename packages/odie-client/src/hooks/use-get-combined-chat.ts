import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenterSelect } from '@automattic/data-stores';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useIsMutating } from '@tanstack/react-query';
import { useSelect } from '@wordpress/data';
import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import {
	HELP_CENTER_STORE,
	getOdieTransferMessages,
	getZendeskChatStartedMetaMessage,
} from '../constants';
import { emptyChat } from '../context';
import { useGetZendeskConversation, useOdieChat } from '../data';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';
import {
	getConversationIdFromInteraction,
	getOdieIdFromInteraction,
	getIsRequestingHumanSupport,
} from '../utils';
import { deduplicateZDMessages, isQueuedZendeskMessage } from '../utils/deduplicate-zd-messages';
import { useLoggedOutSession } from './use-logged-out-session';
import type { Chat, Message } from '../types';

/**
 * Whether a failed conversation fetch says the conversation is gone for good (deleted, or
 * no longer visible to this user) rather than temporarily unreachable. Smooch forwards
 * its HTTP failures as-is, so both the status code and the message are checked.
 * @param error - The fetch rejection.
 * @returns True when the conversation should be treated as gone.
 */
const isConversationGoneError = ( error: unknown ) => {
	const failure = error as {
		status?: number;
		statusCode?: number;
		response?: { status?: number };
	} | null;
	const status = failure?.status ?? failure?.statusCode ?? failure?.response?.status;
	if ( status === 403 || status === 404 ) {
		return true;
	}

	const message = error instanceof Error ? error.message : String( error );
	return /not found|does not exist|\b40[34]\b/i.test( message );
};

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
	const navigate = useNavigate();

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

		// The interaction gained a Zendesk conversation this tab is not showing yet:
		// it was escalated from another tab. Reload so this tab switches too,
		// otherwise it keeps sending to Odie. Skipped while this tab is the one
		// transferring (`status === 'transfer'`), which sets the conversation itself.
		const conversationHasChanged =
			!! conversationId &&
			mainChatState.conversationId !== conversationId &&
			chatStatus !== 'transfer';

		// A loaded chat picking up a conversation, as opposed to the initial load or a
		// refresh of a conversation the chat already shows.
		const isSwitchingLoadedChat = conversationHasChanged && chatStatus !== 'loading';

		const needsReload = interactionHasChanged || conversationHasChanged;

		previousOdieIdRef.current = odieId;

		if (
			( isOdieChatLoading && ! interactionHasChanged ) ||
			isLoadingCurrentSupportInteraction ||
			isFetchingConversation ||
			isUploadingUnsentMessages ||
			isLoadingCanConnectToZendesk ||
			( chatStatus !== 'loading' && ! needsReload )
		) {
			return;
		}

		previousUuidRef.current = currentSupportInteraction?.uuid;

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
			// The conversation's part of the chat: the Odie history, the hand-over
			// notices, then the Zendesk messages. `queuedMessages` are the user's
			// messages not in `conversationMessages` yet; `deduplicateZDMessages` drops
			// the ones that are, keeping the server's copy.
			const buildZendeskMessages = (
				queuedMessages: Message[],
				conversationMessages: Message[]
			) => [
				...( odieChat ? filteredOdieMessages : [] ),
				...getOdieTransferMessages( currentSupportInteraction?.bot_slug, hasEnTranslation ),
				getZendeskChatStartedMetaMessage(),
				...deduplicateZDMessages( [ ...queuedMessages, ...conversationMessages ] ),
			];

			setIsFetchingConversation( true );
			getZendeskConversation( conversationId )
				?.then( ( conversation ) => {
					if ( ! conversation ) {
						throw new Error( 'Conversation not found' );
					}

					setMainChatState( ( prevChat ) => {
						// Keep the user's queued messages when the tab already shows this
						// conversation, and also while it is switching to it from the Odie
						// chat (no conversation id yet): a message sent right after the
						// escalation - from this tab or mirrored from another one - may
						// not be in the server response yet and would otherwise be dropped.
						const keepQueuedMessages =
							prevChat.odieId?.toString() === odieId?.toString() &&
							( prevChat.conversationId === conversation.id || ! prevChat.conversationId );

						return {
							odieId: odieId ? Number( odieId ) : null,
							wpcomUserId: odieChat?.wpcomUserId || prevChat.wpcomUserId,
							conversationId: conversation.id,
							messages: buildZendeskMessages(
								keepQueuedMessages ? prevChat.messages.filter( isQueuedZendeskMessage ) : [],
								conversation.messages as Message[]
							),
							provider: 'zendesk',
							status: currentSupportInteraction?.status === 'closed' ? 'closed' : 'loaded',
						};
					} );
				} )
				.catch( ( error ) => {
					recordTracksEvent( 'calypso_odie_zendesk_conversation_not_found', {
						conversation_id: conversationId,
						odie_id: odieId,
						error: error instanceof Error ? error.message : String( error ),
					} );

					if (
						isSwitchingLoadedChat ||
						refreshingAfterReconnect ||
						! isConversationGoneError( error )
					) {
						// The conversation exists: another tab just created it, this chat
						// was already showing it, or the failure does not say it is gone. So
						// treat it as transient and keep what we have rather than start
						// over. Live messages still arrive through the Zendesk listener, and
						// the next reconnect or Smooch re-init re-downloads the history.
						setMainChatState( ( prevChat ) =>
							prevChat.conversationId === conversationId
								? { ...prevChat, status: 'loaded' }
								: {
										...prevChat,
										// Same identity the success path sets: a chat whose odieId does not
										// match the interaction reads as "changed" and would be fetched again.
										odieId: odieId ? Number( odieId ) : null,
										wpcomUserId: odieChat?.wpcomUserId || prevChat.wpcomUserId,
										conversationId,
										messages: buildZendeskMessages(
											prevChat.messages.filter( isQueuedZendeskMessage ),
											[]
										),
										provider: 'zendesk',
										status: 'loaded',
								  }
						);
						return;
					}

					// Initial load: the conversation is gone for good, e.g. the Zendesk user
					// was deleted. Start over with a fresh chat, the way a not-found
					// interaction is handled; the fresh chat creates its own interaction on
					// the first message.
					navigate( '/odie' );
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
		navigate,
		isLoadingCanConnectToZendesk,
		sessionId,
		botSlug,
		isLoadingCurrentSupportInteraction,
		hasEnTranslation,
		mainChatState?.messages?.length,
		mainChatState?.odieId,
		mainChatState?.conversationId,
		odieChat,
	] );

	return { mainChatState, setMainChatState };
};
