import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { clearOdieStorage, useOdieStorage } from '../data';
import { getOdieInitialMessage } from './get-odie-initial-message';
import { useLoadPreviousChat } from './use-load-previous-chat';
import type { Chat, Context, Message, Nudge, OdieAllowedBots } from '../types';
import type { ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

/*
 * This is the interface for the context. It contains all the methods and values that are
 * available to the components that are wrapped in the provider.
 *
 */
interface OdieAssistantContextInterface {
	addMessage: ( message: Message | Message[] ) => void;
	botName?: string;
	botNameSlug: OdieAllowedBots;
	botSetting?: string;
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
	sendNudge: ( nudge: Nudge ) => void;
	setChat: ( chat: Chat ) => void;
	setIsLoadingChat: ( isLoadingChat: boolean ) => void;
	setMessageLikedStatus: ( message: Message, liked: boolean ) => void;
	setContext: ( context: Context ) => void;
	setIsNudging: ( isNudging: boolean ) => void;
	setIsVisible: ( isVisible: boolean ) => void;
	setIsLoading: ( isLoading: boolean ) => void;
	trackEvent: ( event: string, properties?: Record< string, unknown > ) => void;
}

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
	sendNudge: noop,
	setChat: noop,
	setIsLoadingChat: noop,
	setMessageLikedStatus: noop,
	setContext: noop,
	setIsNudging: noop,
	setIsVisible: noop,
	setIsLoading: noop,
	trackEvent: noop,
};

// Create a default new context
const OdieAssistantContext = createContext< OdieAssistantContextInterface >(
	defaultContextInterfaceValues
);

// Custom hook to access the OdieAssistantContext
const useOdieAssistantContext = () => useContext( OdieAssistantContext );

// Create a provider component for the context
const OdieAssistantProvider = ( {
	botName = 'Wapuu assistant',
	botNameSlug = 'wpcom-support-chat',
	botSetting = 'wapuu',
	initialUserMessage,
	isMinimized = false,
	extraContactOptions,
	enabled = true,
	children,
}: {
	botName?: string;
	botNameSlug: OdieAllowedBots;
	botSetting?: string;
	enabled?: boolean;
	initialUserMessage?: string | null | undefined;
	isMinimized?: boolean;
	extraContactOptions?: ReactNode;
	children?: ReactNode;
} ) => {
	const dispatch = useDispatch();

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

	const clearChat = useCallback( () => {
		clearOdieStorage( 'chat_id' );
		setChat( {
			chat_id: null,
			messages: [ getOdieInitialMessage( botNameSlug ) ],
		} );
		recordTracksEvent( 'calypso_odie_chat_cleared' );
	}, [ botNameSlug ] );

	const trackEvent = ( event: string, properties?: Record< string, unknown > ) => {
		dispatch( recordTracksEvent( event, properties ) );
	};

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
	const addMessage = ( message: Message | Message[] ) => {
		setChat( ( prevChat ) => {
			// Normalize message to always be an array
			const newMessages = Array.isArray( message ) ? message : [ message ];

			// Check if any message is a placeholder
			const hasPlaceholder = prevChat.messages.some( ( msg ) => msg.type === 'placeholder' );

			// Check if the new message is of type 'dislike-feedback'
			const isNewMessageDislikeFeedback = newMessages.some(
				( msg ) => msg.type === 'dislike-feedback'
			);

			// Remove placeholders if the new message is not 'dislike-feedback'
			const filteredMessages =
				hasPlaceholder && ! isNewMessageDislikeFeedback
					? prevChat.messages.filter( ( msg ) => msg.type !== 'placeholder' )
					: prevChat.messages;

			// If the new message is 'dislike-feedback' and there's a placeholder, insert it before the placeholder
			if ( hasPlaceholder && isNewMessageDislikeFeedback ) {
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
				botSetting,
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
				sendNudge: setLastNudge,
				setChat,
				setIsLoadingChat: noop,
				setMessageLikedStatus,
				setContext: noop,
				setIsLoading,
				setIsNudging,
				setIsVisible,
				trackEvent,
			} }
		>
			{ children }
		</OdieAssistantContext.Provider>
	);
};

export { OdieAssistantContext, OdieAssistantProvider, useOdieAssistantContext };
