import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
	broadcastChatClearance,
	clearOdieStorage,
	useOdieBroadcastWithCallbacks,
	useOdieStorage,
} from '../data';
import { getOdieInitialMessage } from './get-odie-initial-message';
import { useLoadPreviousChat } from './use-load-previous-chat';
import type { Chat, Context, Message, Nudge, OdieAllowedBots } from '../types';
import type { ReactNode, FC, PropsWithChildren } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

/*
 * This is the interface for the context. It contains all the methods and values that are
 * available to the components that are wrapped in the provider.
 *
 */
type OdieAssistantContextInterface = {
	addMessage: ( message: Message | Message[] ) => void;
	botName?: string;
	botNameSlug: OdieAllowedBots;
	chat: Chat;
	clearChat: () => void;
	initialUserMessage: string | null | undefined;
	isLoadingChat: boolean;
	isLoading: boolean;
	isMinimized?: boolean;
	isNudging: boolean;
	isVisible: boolean;
	extraContactOptions?: ReactNode;
	lastNudge: Nudge | null;
	odieClientId: string;
	sendNudge: ( nudge: Nudge ) => void;
	setChat: ( chat: Chat ) => void;
	setIsLoadingChat: ( isLoadingChat: boolean ) => void;
	setMessageLikedStatus: ( message: Message, liked: boolean ) => void;
	setContext: ( context: Context ) => void;
	setIsNudging: ( isNudging: boolean ) => void;
	setIsVisible: ( isVisible: boolean ) => void;
	setIsLoading: ( isLoading: boolean ) => void;
	trackEvent: ( event: string, properties?: Record< string, unknown > ) => void;
	updateMessage: ( message: Message ) => void;
};

const defaultContextInterfaceValues = {
	addMessage: noop,
	botName: 'Wapuu',
	botNameSlug: 'wpcom-support-chat' as OdieAllowedBots,
	chat: { context: { section_name: '', site_id: null }, messages: [] },
	clearChat: noop,
	initialUserMessage: null,
	isLoadingChat: false,
	isLoading: false,
	isMinimized: false,
	isNudging: false,
	isVisible: false,
	lastNudge: null,
	odieClientId: '',
	sendNudge: noop,
	setChat: noop,
	setIsLoadingChat: noop,
	setMessageLikedStatus: noop,
	setContext: noop,
	setIsNudging: noop,
	setIsVisible: noop,
	setIsLoading: noop,
	trackEvent: noop,
	updateMessage: noop,
};

// Create a default new context
const OdieAssistantContext = createContext< OdieAssistantContextInterface >(
	defaultContextInterfaceValues
);

// Custom hook to access the OdieAssistantContext
const useOdieAssistantContext = () => useContext( OdieAssistantContext );

// Generate random client id
export const odieClientId = Math.random().toString( 36 ).substring( 2, 15 );

type OdieAssistantProviderProps = {
	botName?: string;
	botNameSlug: OdieAllowedBots;
	enabled?: boolean;
	initialUserMessage?: string | null | undefined;
	isMinimized?: boolean;
	extraContactOptions?: ReactNode;
	logger?: ( message: string, properties: Record< string, unknown > ) => void;
	loggerEventNamePrefix?: string;
	children?: ReactNode;
} & PropsWithChildren;
// Create a provider component for the context
const OdieAssistantProvider: FC< OdieAssistantProviderProps > = ( {
	botName = 'Wapuu assistant',
	botNameSlug = 'wpcom-support-chat',
	initialUserMessage,
	isMinimized = false,
	extraContactOptions,
	enabled = true,
	logger,
	loggerEventNamePrefix,
	children,
} ) => {
	const [ isVisible, setIsVisible ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isNudging, setIsNudging ] = useState( false );
	const [ lastNudge, setLastNudge ] = useState< Nudge | null >( null );
	const existingChatIdString = useOdieStorage( 'chat_id' );
	const existingChatId = existingChatIdString ? parseInt( existingChatIdString, 10 ) : null;
	const existingChat = useLoadPreviousChat( botNameSlug, existingChatId );

	const [ chat, setChat ] = useState< Chat >( existingChat );

	useEffect( () => {
		if ( existingChat.chat_id ) {
			setChat( existingChat );
		}
	}, [ existingChat, existingChat.chat_id ] );

	const trackEvent = useCallback(
		( eventName: string, properties: Record< string, unknown > = {} ) => {
			const event = loggerEventNamePrefix ? `${ loggerEventNamePrefix }_${ eventName }` : eventName;
			logger?.( event, {
				...properties,
				chat_id: chat?.chat_id,
				bot_name_slug: botNameSlug,
			} );
		},
		[ botNameSlug, chat?.chat_id, logger, loggerEventNamePrefix ]
	);

	const clearChat = useCallback( () => {
		clearOdieStorage( 'chat_id' );
		setChat( {
			chat_id: null,
			messages: [ getOdieInitialMessage( botNameSlug ) ],
		} );
		trackEvent( 'chat_cleared', {} );
		broadcastChatClearance( odieClientId );
	}, [ botNameSlug, trackEvent ] );

	const setMessageLikedStatus = ( message: Message, liked: boolean ) => {
		setChat( ( prevChat ) => {
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

	// This might need a rework in the future, like connecting messages to a client_chat_id and
	// Update it to be a message.type = 'message' in order to keep simplicity.
	const addMessage = useCallback(
		( message: Message | Message[] ) => {
			setChat( ( prevChat ) => {
				// Normalize message to always be an array
				const newMessages = Array.isArray( message ) ? message : [ message ];

				// Check if the new message is of type 'dislike-feedback'
				const isNewMessageDislikeFeedback = newMessages.some(
					( msg ) => msg.type === 'dislike-feedback'
				);

				const filteredMessages = ! isNewMessageDislikeFeedback
					? prevChat.messages.filter( ( msg ) => msg.type !== 'placeholder' )
					: prevChat.messages;

				// If the new message is 'dislike-feedback' and there's a placeholder, insert it before the placeholder
				if ( isNewMessageDislikeFeedback ) {
					const lastPlaceholderIndex = prevChat.messages
						.map( ( msg ) => msg.type )
						.lastIndexOf( 'placeholder' );
					return {
						chat_id: prevChat.chat_id,
						messages: [
							...prevChat.messages.slice( 0, lastPlaceholderIndex ), // Take all messages before the last placeholder
							...newMessages, // Insert new 'dislike-feedback' messages
							...prevChat.messages.slice( lastPlaceholderIndex ), // Add back the placeholder and any messages after it
						],
					};
				}

				// For all other cases, append new messages at the end, without placeholders if not 'dislike-feedback'
				return {
					chat_id: prevChat.chat_id,
					messages: [ ...filteredMessages, ...newMessages ],
				};
			} );
		},
		[ setChat ]
	);

	useOdieBroadcastWithCallbacks( { addMessage, clearChat }, odieClientId );

	const updateMessage = ( message: Partial< Message > ) => {
		setChat( ( prevChat ) => {
			const updatedMessages = prevChat.messages.map( ( m ) =>
				( message.internal_message_id && m.internal_message_id === message.internal_message_id ) ||
				( message.message_id && m.message_id === message.message_id )
					? { ...m, ...message }
					: m
			);

			return { ...prevChat, messages: updatedMessages };
		} );
	};

	if ( ! enabled ) {
		return <>{ children }</>;
	}

	return (
		<OdieAssistantContext.Provider
			value={ {
				addMessage,
				botName,
				botNameSlug,
				chat,
				clearChat,
				extraContactOptions,
				initialUserMessage,
				isLoadingChat: false,
				isLoading: isLoading,
				isMinimized,
				isNudging,
				isVisible,
				lastNudge,
				odieClientId,
				sendNudge: setLastNudge,
				setChat,
				setIsLoadingChat: noop,
				setMessageLikedStatus,
				setContext: noop,
				setIsLoading,
				setIsNudging,
				setIsVisible,
				trackEvent,
				updateMessage,
			} }
		>
			{ children }
		</OdieAssistantContext.Provider>
	);
};

export { OdieAssistantContext, useOdieAssistantContext, OdieAssistantProvider };
