import { useSmooch, SMOOCH_CONTAINER_ID } from '@automattic/zendesk-client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
	broadcastChatClearance,
	useSetOdieStorage,
	useOdieBroadcastWithCallbacks,
	useGetOdieStorage,
} from '../data';
import { transformMessage } from '../utils/conversation-utils';
import { getOdieInitialMessage } from './get-odie-initial-message';
import { useLoadPreviousChat } from './use-load-previous-chat';
import type { Chat, Context, CurrentUser, Message, Nudge, OdieAllowedBots } from '../types/';
import type { ReactNode, FC, PropsWithChildren, SetStateAction } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};
type ScrollToLastMessageType = () => void;

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
	currentUser: CurrentUser;
	initialUserMessage: string | null | undefined;
	isLoadingChat: boolean;
	isLoading: boolean;
	isMinimized?: boolean;
	isNudging: boolean;
	isVisible: boolean;
	extraContactOptions?: ReactNode;
	lastNudge: Nudge | null;
	lastMessageInView?: boolean;
	navigateToSupportDocs?: ( blogId: string, postId: string, title: string, link: string ) => void;
	odieClientId: string;
	sendNudge: ( nudge: Nudge ) => void;
	selectedSiteId?: number | null;
	selectedSiteUrl?: string | null;
	sectionName?: string | null;
	setChat: ( chat: SetStateAction< Chat > ) => void;
	setIsLoadingChat: ( isLoadingChat: boolean ) => void;
	setMessageLikedStatus: ( message: Message, liked: boolean ) => void;
	setLastMessageInView?: ( lastMessageInView: boolean ) => void;
	setContext: ( context: Context ) => void;
	setIsNudging: ( isNudging: boolean ) => void;
	setIsVisible: ( isVisible: boolean ) => void;
	setIsLoading: ( isLoading: boolean ) => void;
	setScrollToLastMessage: ( scrollToLastMessage: ScrollToLastMessageType ) => void;
	scrollToLastMessage: ScrollToLastMessageType | null;
	trackEvent: ( event: string, properties?: Record< string, unknown > ) => void;
	updateMessage: ( message: Message ) => void;
	version?: string | null;
};

const defaultContextInterfaceValues = {
	addMessage: noop,
	botName: 'Wapuu',
	botNameSlug: 'wpcom-support-chat' as OdieAllowedBots,
	chat: { context: { section_name: '', site_id: null }, messages: [], type: 'ai' as const },
	clearChat: noop,
	initialUserMessage: null,
	isLoadingChat: false,
	isLoading: false,
	isMinimized: false,
	isNudging: false,
	isVisible: false,
	lastNudge: null,
	lastMessageRef: null,
	navigateToSupportDocs: noop,
	odieClientId: '',
	currentUser: { display_name: 'Me' },
	sendNudge: noop,
	setChat: noop,
	setIsLoadingChat: noop,
	setMessageLikedStatus: noop,
	setContext: noop,
	setIsNudging: noop,
	setIsVisible: noop,
	setIsLoading: noop,
	setScrollToLastMessage: noop,
	scrollToLastMessage: noop,
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
	currentUser: CurrentUser;
	extraContactOptions?: ReactNode;
	logger?: ( message: string, properties: Record< string, unknown > ) => void;
	loggerEventNamePrefix?: string;
	navigateToSupportDocs?: ( blogId: string, postId: string, title: string, link: string ) => void;
	selectedSiteId?: number | null;
	selectedSiteUrl?: string | null;
	sectionName?: string | null;
	version?: string | null;
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
	navigateToSupportDocs,
	selectedSiteId,
	selectedSiteUrl,
	sectionName,
	version = null,
	currentUser,
	children,
} ) => {
	const [ isVisible, setIsVisible ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isNudging, setIsNudging ] = useState( false );
	const [ lastNudge, setLastNudge ] = useState< Nudge | null >( null );
	const [ scrollToLastMessage, setScrollToLastMessage ] =
		useState< ScrollToLastMessageType | null >( null );
	const { init, addMessengerListener } = useSmooch();

	const [ lastMessageInView, setLastMessageInView ] = useState( true );

	const existingChatIdString = useGetOdieStorage( 'chat_id' );

	const existingChatId = existingChatIdString ? parseInt( existingChatIdString, 10 ) : null;
	const existingChat = useLoadPreviousChat( botNameSlug, existingChatId );

	const urlSearchParams = new URLSearchParams( window.location.search );
	const versionParams = urlSearchParams.get( 'version' );

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

	const setOdieStorage = useSetOdieStorage( 'chat_id' );

	const clearChat = useCallback( () => {
		setOdieStorage( null );
		setChat( {
			chat_id: null,
			type: 'ai',
			messages: [ getOdieInitialMessage( botNameSlug ) ],
		} );
		trackEvent( 'chat_cleared', {} );
		broadcastChatClearance( odieClientId );
	}, [ botNameSlug, trackEvent, setOdieStorage ] );

	const setMessageLikedStatus = useCallback( ( message: Message, liked: boolean ) => {
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
	}, [] );

	const addMessage = useCallback(
		( message: Message | Message[] ) => {
			setChat( ( prevChat ) => {
				// Normalize message to always be an array
				const newMessages = Array.isArray( message ) ? message : [ message ];

				// Filter out 'placeholder' messages if new message is not 'dislike-feedback'
				const filteredMessages = newMessages.some( ( msg ) => msg.type === 'dislike-feedback' )
					? prevChat.messages
					: prevChat.messages.filter( ( msg ) => msg.type !== 'placeholder' );

				// Append new messages at the end
				return {
					chat_id: prevChat.chat_id,
					type: newMessages.find( ( m ) => m.role === 'agent' ) ? 'human' : prevChat.type,
					messages: [ ...filteredMessages, ...newMessages ],
				};
			} );
		},
		[ setChat ]
	);

	useEffect( () => {
		if ( init ) {
			addMessengerListener( ( message: Parameters< typeof transformMessage >[ 0 ] ) => {
				const translatedMessage = transformMessage( message );
				addMessage( translatedMessage );
			} );
		}
	}, [ addMessage, init ] );

	useOdieBroadcastWithCallbacks( { addMessage, clearChat }, odieClientId );

	const updateMessage = useCallback(
		( message: Partial< Message > ) => {
			setChat( ( prevChat ) => {
				const updatedMessages = prevChat.messages.map( ( prevMessage ) =>
					( message.internal_message_id &&
						prevMessage.internal_message_id === message.internal_message_id ) ||
					( message.message_id && prevMessage.message_id === message.message_id )
						? { ...prevMessage, ...message }
						: prevMessage
				);

				return { ...prevChat, messages: updatedMessages };
			} );
		},
		[ setChat ]
	);

	const overridenVersion = versionParams || version;

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
				currentUser,
				extraContactOptions,
				initialUserMessage,
				isLoadingChat: false,
				isLoading: isLoading,
				isMinimized,
				isNudging,
				isVisible,
				lastNudge,
				lastMessageInView,
				navigateToSupportDocs,
				odieClientId,
				selectedSiteId,
				selectedSiteUrl,
				sectionName,
				sendNudge: setLastNudge,
				setChat,
				setIsLoadingChat: noop,
				setMessageLikedStatus,
				setLastMessageInView,
				setContext: noop,
				setIsLoading,
				setIsNudging,
				setIsVisible,
				setScrollToLastMessage: setScrollToLastMessage ?? noop,
				scrollToLastMessage: scrollToLastMessage ?? noop,
				trackEvent,
				updateMessage,
				version: overridenVersion,
			} }
		>
			{ children }
			<div style={ { display: 'none' } } id={ SMOOCH_CONTAINER_ID }></div>
		</OdieAssistantContext.Provider>
	);
};

export { OdieAssistantContext, useOdieAssistantContext, OdieAssistantProvider };
