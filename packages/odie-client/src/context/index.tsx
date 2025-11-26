import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { createContext, useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ODIE_NEW_INTERACTIONS_BOT_SLUG } from '../constants';
import { useOdieBroadcastWithCallbacks } from '../data';
// Use v2 hooks for testing - can easily switch back to old implementation
import { useGetCombinedChat } from '../hooks/v2';
import { isOdieAllowedBot, getIsRequestingHumanSupport } from '../utils';
import type {
	Chat,
	Message,
	OdieAllowedBots,
	ChatStatus,
	OdieAssistantContextInterface,
	OdieAssistantProviderProps,
} from '../types';
import type { HelpCenterSelect } from '@automattic/data-stores';

const noop = () => {};

export const emptyChat: Chat = {
	odieId: null,
	conversationId: null,
	messages: [],
	wpcomUserId: null,
	provider: 'odie',
	status: 'loading',
};

// Create a default new context
export const OdieAssistantContext = createContext< OdieAssistantContextInterface >( {
	addMessage: noop,
	updateMessage: noop,
	botName: 'Wapuu',
	newInteractionsBotSlug: ODIE_NEW_INTERACTIONS_BOT_SLUG,
	chat: emptyChat,
	canConnectToZendesk: false,
	isLoadingCanConnectToZendesk: false,
	clearChat: noop,
	currentUser: { display_name: 'Me' },
	experimentVariationName: null,
	hasUserEverEscalatedToHumanSupport: false,
	isChatLoaded: false,
	isMinimized: false,
	isUserEligibleForPaidSupport: false,
	odieBroadcastClientId: '',
	setChat: noop,
	setChatStatus: noop,
	setExperimentVariationName: noop,
	setMessageLikedStatus: noop,
	trackEvent: noop,
	forceEmailSupport: false,
	isChatRestricted: false,
} );

// Custom hook to access the OdieAssistantContext
export const useOdieAssistantContext = () => useContext( OdieAssistantContext );

// Generate random client id
export const odieBroadcastClientId = Math.random().toString( 36 ).substring( 2, 15 );

/**
 * Provider for the Odie Assistant context.
 */
export const OdieAssistantProvider: React.FC< OdieAssistantProviderProps > = ( {
	botName = 'Wapuu assistant',
	newInteractionsBotSlug,
	isUserEligibleForPaidSupport = true,
	canConnectToZendesk = false,
	isLoadingCanConnectToZendesk = false,
	selectedSiteId,
	selectedSiteURL,
	userFieldMessage,
	userFieldFlowName,
	version = null,
	currentUser,
	forceEmailSupport = false,
	isChatRestricted = false,
	children,
} ) => {
	const { dynamicNewInteractionsBotSlug, isMinimized, isChatLoaded } = useSelect(
		( select ) => {
			const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;

			const odieBotNameSlug = isOdieAllowedBot( store.getOdieBotNameSlug() )
				? ( store.getOdieBotNameSlug() as OdieAllowedBots )
				: newInteractionsBotSlug;

			return {
				dynamicNewInteractionsBotSlug: odieBotNameSlug,
				isMinimized: store.getIsMinimized(),
				isChatLoaded: store.getIsChatLoaded(),
			};
		},
		[ newInteractionsBotSlug ]
	);

	const navigate = useNavigate();

	const [ experimentVariationName, setExperimentVariationName ] = useState<
		string | null | undefined
	>( null );

	/**
	 * The main chat thread.
	 * This is where we manage the state of the chat.
	 * Using v2 hooks with derived state pattern.
	 */
	const {
		mainChatState,
		setMainChatState,
		statusFlags,
		messages: messagesStore,
	} = useGetCombinedChat(
		isUserEligibleForPaidSupport && canConnectToZendesk,
		isLoadingCanConnectToZendesk
	);

	// Note: The sending flag is automatically cleared when the derived state
	// changes from 'sending' to 'loaded'. The flag should be cleared by the
	// code that sets it (e.g., in onSettled callbacks), not by watching status.

	/**
	 * Has the user ever escalated to get human support?
	 */
	const hasUserEverEscalatedToHumanSupport = mainChatState?.messages.some( ( message ) =>
		getIsRequestingHumanSupport( message )
	);

	/**
	 * Tracking event.
	 * Handler to make sure all requests are the same.
	 */
	const trackEvent = useCallback(
		( eventName: string, properties: Record< string, unknown > = {} ) => {
			recordTracksEvent( `calypso_odie_${ eventName }`, {
				...properties,
				chat_id: mainChatState?.odieId,
				bot_name_slug: newInteractionsBotSlug,
			} );
		},
		[ newInteractionsBotSlug, mainChatState ]
	);

	const clearChat = useCallback( () => {
		trackEvent( 'chat_cleared', {} );
		// Clear status flags
		statusFlags.setSending( false );
		statusFlags.setTransferring( false );
		// Navigate to /odie without the id parameter to reset the interaction
		navigate( '/odie', { replace: true } );
	}, [ trackEvent, navigate, statusFlags ] );

	/**
	 * Add a new message to the chat.
	 * With v2 hooks, we can use the messages store directly for better performance.
	 */
	const addMessage = useCallback(
		( message: Message | Message[] ) => {
			// Use setMainChatState for backward compatibility
			// The v2 hook's setMainChatState will handle updating the message store
			setMainChatState( ( prevChat ) => ( {
				...prevChat,
				messages: [ ...prevChat.messages, ...( Array.isArray( message ) ? message : [ message ] ) ],
			} ) );
		},
		[ setMainChatState ]
	);

	/**
	 * Update an existing message in the chat (e.g., when a temporary message is confirmed as received).
	 * Matches by temporary_id, message_id, or internal_message_id.
	 */
	const updateMessage = useCallback(
		(
			updatedMessage: Message,
			matchBy: 'temporary_id' | 'message_id' | 'internal_message_id' = 'temporary_id'
		) => {
			// Use the messages store directly for better performance
			messagesStore.updateMessage( updatedMessage, matchBy );
		},
		[ messagesStore ]
	);

	/**
	 * Set the status of the chat.
	 * With v2 hooks, status is derived from flags, so we update the flags instead.
	 * This maintains backward compatibility with the old API.
	 */
	const setChatStatus = useCallback(
		( status: ChatStatus ) => {
			// Map status to status flags
			switch ( status ) {
				case 'sending':
					statusFlags.setSending( true );
					break;
				case 'transfer':
					statusFlags.setTransferring( true );
					break;
				case 'loaded':
					// Clear both flags when going back to loaded
					statusFlags.setSending( false );
					statusFlags.setTransferring( false );
					break;
				case 'loading':
				case 'closed':
				case 'dislike':
					// These are derived from other sources (API loading, interaction status, etc.)
					// We can't directly set them, but the derived state will handle them
					break;
			}
		},
		[ statusFlags ]
	);

	/**
	 * Set the liked status of a message.
	 */
	const setMessageLikedStatus = ( message: Message, liked: boolean ) => {
		setMainChatState( ( prevChat ) => {
			const messageIndex = prevChat.messages.findIndex( ( m ) => m === message );
			const updatedMessage = { ...message, liked };
			return {
				...prevChat,
				messages: [
					...prevChat.messages.slice( 0, messageIndex ),
					updatedMessage,
					...prevChat.messages.slice( messageIndex + 1 ),
				],
			};
		} );
	};

	useOdieBroadcastWithCallbacks( { addMessage }, odieBroadcastClientId );

	/**
	 * Version for Odie API.
	 * Set this query param to override the version in the request.
	 */
	const urlSearchParams = new URLSearchParams( window.location.search );
	const versionParams = urlSearchParams.get( 'version' );
	const overriddenVersion = versionParams || version;

	return (
		<OdieAssistantContext.Provider
			value={ {
				addMessage,
				updateMessage,
				botName,
				newInteractionsBotSlug: dynamicNewInteractionsBotSlug,
				chat: mainChatState,
				setChat: setMainChatState,
				clearChat,
				currentUser,
				isChatLoaded,
				isMinimized,
				experimentVariationName,
				isUserEligibleForPaidSupport,
				canConnectToZendesk,
				isLoadingCanConnectToZendesk,
				hasUserEverEscalatedToHumanSupport,
				odieBroadcastClientId,
				selectedSiteId,
				selectedSiteURL,
				userFieldMessage,
				userFieldFlowName,
				setChatStatus,
				setExperimentVariationName,
				setMessageLikedStatus,
				trackEvent,
				version: overriddenVersion,
				forceEmailSupport,
				isChatRestricted,
			} }
		>
			{ children }
		</OdieAssistantContext.Provider>
	);
};
