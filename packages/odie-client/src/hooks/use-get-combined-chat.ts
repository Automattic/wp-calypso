import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenterSelect } from '@automattic/data-stores';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useIsMutating, useQueryClient } from '@tanstack/react-query';
import { useSelect } from '@wordpress/data';
import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import { getMessageUniqueIdentifier } from '../components/message/utils/get-message-unique-identifier';
import {
	HELP_CENTER_STORE,
	getOdieTransferMessages,
	getZendeskChatStartedMetaMessage,
} from '../constants';
import { emptyChat } from '../context';
import {
	getZendeskConversationHistoryQueryKey,
	useAuthenticateZendeskMessaging,
	useGetZendeskConversation,
	useGetZendeskConversationHistory,
	useOdieChat,
} from '../data';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';
import {
	getConversationIdFromInteraction,
	getOdieIdFromInteraction,
	getIsRequestingHumanSupport,
} from '../utils';
import { useLoggedOutSession } from './use-logged-out-session';
import type { Chat, Message } from '../types';
import type { CheckoutSupportVariation } from '@automattic/data-stores';

/**
 * Adds the checkout support variation, as the Odie events recorded through the context do.
 * @param properties - The event's properties.
 * @param checkoutSupportVariation - Only set when support was opened from checkout in the experiment.
 * @returns The properties, with the variation when there is one.
 */
function withCheckoutSupportVariation(
	properties: Record< string, unknown >,
	checkoutSupportVariation: CheckoutSupportVariation | undefined
) {
	return checkoutSupportVariation
		? { ...properties, checkout_support_variation: checkoutSupportVariation }
		: properties;
}

function isEqual( message1: Message, message2: Message ) {
	const message1Id = getMessageUniqueIdentifier( message1 );
	const message2Id = getMessageUniqueIdentifier( message2 );
	return message1Id && message1Id === message2Id;
}

/**
 * A user message sent through Zendesk: only those carry a `temporary_id`, so Odie messages don't match.
 * @param message - The message to check.
 * @returns Whether the message is a Zendesk message sent by the user.
 */
function isQueuedZendeskMessage( message: Message ) {
	return message.role === 'user' && !! message.metadata?.temporary_id;
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

function getOldestReceived( messages: Message[] ) {
	return messages.reduce< number | undefined >(
		( oldest, { received } ) =>
			received && ( ! oldest || received < oldest ) ? received : oldest,
		undefined
	);
}

/**
 * Put the older Zendesk messages right after the "support request started" divider.
 * @param messages - The chat messages.
 * @param history - The older Zendesk messages.
 * @returns The chat messages with the history in place.
 */
function insertZendeskHistory( messages: Message[], history: Message[] ) {
	const divider = getZendeskChatStartedMetaMessage();
	const dividerIndex = messages.findIndex( ( message ) => isEqual( message, divider ) );
	return [
		...messages.slice( 0, dividerIndex + 1 ),
		...deduplicateZDMessages( [ ...history, ...messages.slice( dividerIndex + 1 ) ] ),
	];
}

/**
 * The chat to show after a refresh asked for in the background. It keeps the chat on show when:
 * - anything changed it since the refresh was asked for (a send, a reply, a transfer, a file): that
 *   wins, and the next refresh catches up;
 * - the rebuilt chat is another conversation: only a load moves a chat to a human or back;
 * - the rebuilt chat brings no new message and no new status, so it neither re-renders nor scrolls.
 * @param prevChat - The chat on show.
 * @param rebuiltChat - The chat rebuilt from fresh data.
 * @param chatWhenRequested - The chat on show when the refresh was asked for.
 * @returns The chat to show.
 */
function applyBackgroundRefresh( prevChat: Chat, rebuiltChat: Chat, chatWhenRequested: Chat ) {
	if ( prevChat !== chatWhenRequested || rebuiltChat.conversationId !== prevChat.conversationId ) {
		return prevChat;
	}
	const idsOnShow = new Set(
		prevChat.messages.map( ( message ) => getMessageUniqueIdentifier( message ) )
	);
	const hasNewMessage = rebuiltChat.messages.some( ( message ) => {
		const id = getMessageUniqueIdentifier( message );
		return id !== undefined && ! idsOnShow.has( id );
	} );
	return hasNewMessage || rebuiltChat.status !== prevChat.status ? rebuiltChat : prevChat;
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
	const { isChatLoaded, connectionStatus, zendeskClientId, checkoutSupportVariation } = useSelect(
		( select ) => {
			const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;

			return {
				isChatLoaded: store.getIsChatLoaded(),
				connectionStatus: store.getZendeskConnectionStatus(),
				zendeskClientId: store.getZendeskClientId(),
				checkoutSupportVariation: store.getCheckoutSupportVariation(),
			};
		},
		[]
	);
	// Read when an event is recorded, so the effects below don't run again when it changes.
	const checkoutSupportVariationRef = useRef( checkoutSupportVariation );
	checkoutSupportVariationRef.current = checkoutSupportVariation;
	const previousUuidRef = useRef< string | undefined >( undefined );
	const previousOdieIdRef = useRef< string | null | undefined >( undefined );
	const wasChatLoadedRef = useRef( isChatLoaded );
	const [ mainChatState, setMainChatState ] = useState< Chat >( emptyChat );
	// The chat as last rendered, so a background refresh can tell whether anything changed it since.
	const chatOnShowRef = useRef( mainChatState );
	chatOnShowRef.current = mainChatState;
	const [ backgroundRefresh, setBackgroundRefresh ] = useState< {
		chatWhenRequested: Chat;
	} | null >( null );
	const conversationId = getConversationIdFromInteraction( currentSupportInteraction );
	const [ refreshingAfterReconnect, setRefreshingAfterReconnect ] = useState( false );
	const chatStatus = mainChatState?.status;
	const getZendeskConversation = useGetZendeskConversation();
	const { data: authData } = useAuthenticateZendeskMessaging( canConnectToZendesk, 'messenger' );
	const getZendeskConversationHistory = useGetZendeskConversationHistory();
	const queryClient = useQueryClient();
	const [ historyLoadingConversationId, setHistoryLoadingConversationId ] = useState<
		string | null
	>( null );
	const [ zendeskHistoryRequest, setZendeskHistoryRequest ] = useState< {
		conversationId: string;
		before: number;
	} | null >( null );
	const startedZendeskHistoryRequestRef = useRef( zendeskHistoryRequest );
	const activeZendeskHistoryRequestIdRef = useRef( 0 );
	const { data: odieChat, isFetching: isOdieChatLoading } = useOdieChat(
		Number( odieId ),
		sessionId,
		botSlug
	);
	const [ isFetchingConversation, setIsFetchingConversation ] = useState( false );

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

	/**
	 * Rebuild the chat from fresh data, the way a load does, while it stays on show and usable: its
	 * status stays `loaded`, and the result only replaces a chat that nothing changed since. Call it
	 * after invalidating what should be refetched.
	 */
	const refreshChatInBackground = useCallback( () => {
		const chat = chatOnShowRef.current;
		// Re-checked here: a send or a transfer may have started while the caller refetched.
		if ( chat.status === 'loaded' ) {
			setBackgroundRefresh( { chatWhenRequested: chat } );
		}
	}, [] );

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

	// Smooch only hands over the latest page of messages; load the older ones in the background.
	useEffect( () => {
		if ( ! zendeskHistoryRequest || ! authData?.jwt ) {
			return;
		}

		if ( startedZendeskHistoryRequestRef.current === zendeskHistoryRequest ) {
			return;
		}

		startedZendeskHistoryRequestRef.current = zendeskHistoryRequest;
		const historyConversationId = zendeskHistoryRequest.conversationId;
		const requestId = ++activeZendeskHistoryRequestIdRef.current;
		setHistoryLoadingConversationId( historyConversationId );
		getZendeskConversationHistory( {
			conversationId: historyConversationId,
			before: zendeskHistoryRequest.before,
			clientId: zendeskClientId,
			jwt: authData.jwt,
		} )
			.then( ( { messages, truncated } ) => {
				recordTracksEvent(
					'calypso_odie_zendesk_conversation_history_loaded',
					withCheckoutSupportVariation(
						{
							conversation_id: historyConversationId,
							message_count: messages.length,
							truncated,
						},
						checkoutSupportVariationRef.current
					)
				);
				if ( messages.length ) {
					setMainChatState( ( prevChat ) =>
						prevChat.conversationId === historyConversationId
							? {
									...prevChat,
									messages: insertZendeskHistory( prevChat.messages, messages as Message[] ),
								}
							: prevChat
					);
				}
			} )
			.catch( ( error ) => {
				recordTracksEvent(
					'calypso_odie_zendesk_conversation_history_failed',
					withCheckoutSupportVariation(
						{
							conversation_id: historyConversationId,
							error: error instanceof Error ? error.message : String( error ),
						},
						checkoutSupportVariationRef.current
					)
				);
				// Forget the failed request, so the next background refresh asks for it again.
				setZendeskHistoryRequest( ( currentRequest ) =>
					currentRequest === zendeskHistoryRequest ? null : currentRequest
				);
			} )
			.finally( () => {
				if ( activeZendeskHistoryRequestIdRef.current === requestId ) {
					setHistoryLoadingConversationId( null );
				}
			} );
	}, [ zendeskHistoryRequest, zendeskClientId, authData?.jwt, getZendeskConversationHistory ] );

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
			( chatStatus !== 'loading' && ! interactionHasChanged && ! backgroundRefresh )
		) {
			return;
		}

		previousUuidRef.current = currentSupportInteraction?.uuid;

		// A load (the first one, another chat, a reconnect) rebuilds the chat anyway, so it answers a
		// refresh asked for in the background too. A request made after this render stays for the next run.
		const chatWhenRefreshRequested =
			chatStatus !== 'loading' && ! interactionHasChanged
				? backgroundRefresh?.chatWhenRequested
				: undefined;
		const isBackgroundRefresh = !! chatWhenRefreshRequested;
		if ( backgroundRefresh ) {
			setBackgroundRefresh( ( request ) => ( request === backgroundRefresh ? null : request ) );
		}
		// A send or a transfer started since the refresh was asked for: leave the chat to it.
		if ( isBackgroundRefresh && chatStatus !== 'loaded' ) {
			return;
		}
		const showRebuiltChat = ( rebuildChat: ( prevChat: Chat ) => Chat ) =>
			setMainChatState( ( prevChat ) =>
				chatWhenRefreshRequested
					? applyBackgroundRefresh( prevChat, rebuildChat( prevChat ), chatWhenRefreshRequested )
					: rebuildChat( prevChat )
			);

		const supportInteractionId = currentSupportInteraction?.uuid ?? null;

		// We don't have a conversation id, so our chat is simply the odie chat
		if ( ! conversationId ) {
			const shouldLoadOdieChat =
				odieChat &&
				( chatStatus === 'loading' ||
					interactionHasChanged ||
					isBackgroundRefresh ||
					! mainChatState.messages.length );

			// set chat empty state or with messages
			if ( ! currentSupportInteraction?.uuid || shouldLoadOdieChat ) {
				showRebuiltChat( () => ( {
					...( shouldLoadOdieChat ? odieChat : emptyChat ),
					conversationId: null,
					status: 'loaded',
					provider: 'odie',
				} ) );
			}
			return;
		}

		const filteredOdieMessages =
			odieChat?.messages.filter( ( message ) => ! getIsRequestingHumanSupport( message ) ) ?? [];

		// We have an ongoing conversation with Zendesk, but we have some problems connecting to it
		if ( ! canConnectToZendesk ) {
			showRebuiltChat( () => ( {
				messages: [ ...( odieChat ? filteredOdieMessages : [] ) ],
				conversationId,
				status: 'loaded',
				provider: 'zendesk',
			} ) );
			return;
		}

		if ( conversationId && ( isChatLoaded || refreshingAfterReconnect ) ) {
			setIsFetchingConversation( true );
			getZendeskConversation( conversationId )
				?.then( ( conversation ) => {
					if ( conversation ) {
						const before = getOldestReceived( conversation.messages as Message[] );
						const historyRequest = before ? { conversationId: conversation.id, before } : null;
						// A background refresh asks for the older messages again only when the latest page
						// moved or the last request for them failed, so "Loading earlier messages" doesn't
						// show each time the user comes back.
						setZendeskHistoryRequest( ( currentRequest ) =>
							isBackgroundRefresh &&
							currentRequest?.conversationId === historyRequest?.conversationId &&
							currentRequest?.before === historyRequest?.before
								? currentRequest
								: historyRequest
						);
						const historyQueryKey = before
							? getZendeskConversationHistoryQueryKey( conversation.id )
							: null;
						const cachedHistory = historyQueryKey
							? queryClient.getQueryData< Message[] >( historyQueryKey )
							: [];

						showRebuiltChat( ( prevChat ) => {
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
									// Without an Odie chat, the user went straight to a human.
									...getOdieTransferMessages( hasEnTranslation, ! odieId ),
									getZendeskChatStartedMetaMessage(),
									...( deduplicateZDMessages( [
										...( cachedHistory ?? [] ),
										// During connection recovery, the user queued messages can be deleted. This ensure they remain. And `deduplicateZDMessages` takes of duplication.
										...( isSameConversation
											? prevChat.messages.filter( isQueuedZendeskMessage )
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
					recordTracksEvent(
						'calypso_odie_zendesk_conversation_not_found',
						withCheckoutSupportVariation(
							{
								conversation_id: conversationId,
								odie_id: odieId,
								error: error instanceof Error ? error.message : String( error ),
							},
							checkoutSupportVariationRef.current
						)
					);

					// A refresh in the background keeps the chat on show, and the next one tries again.
					if ( isBackgroundRefresh ) {
						return;
					}

					// Leave the loading state, or this effect re-runs and fetches again, forever.
					// Keep the conversation the chat already shows; otherwise show it with the
					// Odie history only, like when Zendesk can't be reached above, so live
					// messages still arrive and the next refresh retries.
					setMainChatState( ( prevChat ) =>
						prevChat.conversationId === conversationId
							? { ...prevChat, status: 'loaded' }
							: {
									...prevChat,
									odieId: odieId ? Number( odieId ) : null,
									messages: [ ...( odieChat ? filteredOdieMessages : [] ) ],
									conversationId,
									status: 'loaded',
									provider: 'zendesk',
								}
					);
				} )
				.finally( () => {
					setRefreshingAfterReconnect( false );
					setIsFetchingConversation( false );
				} );
		}
	}, [
		isOdieChatLoading,
		chatStatus,
		backgroundRefresh,
		refreshingAfterReconnect,
		isUploadingUnsentMessages,
		isChatLoaded,
		isFetchingConversation,
		conversationId,
		odieId,
		currentSupportInteraction,
		canConnectToZendesk,
		getZendeskConversation,
		isLoadingCanConnectToZendesk,
		sessionId,
		botSlug,
		isLoadingCurrentSupportInteraction,
		hasEnTranslation,
		mainChatState?.messages?.length,
		mainChatState?.odieId,
		odieChat,
		queryClient,
	] );

	const isLoadingZendeskHistory =
		!! historyLoadingConversationId &&
		historyLoadingConversationId === mainChatState.conversationId;

	return { mainChatState, setMainChatState, refreshChatInBackground, isLoadingZendeskHistory };
};
