import config from '@automattic/calypso-config';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { clearOdieStorage, useOdieStorage } from '../data';
import useOdieUserTracking from '../track-location/useOdieUserTracking';
import { getOdieInitialMessage } from './get-odie-initial-message';
import { useLoadPreviousChat } from './use-load-previous-chat';
import type { OdieUserTracking } from '../track-location/useOdieUserTracking';
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
	addMessage: ( message: Message ) => void;
	botName?: string;
	botNameSlug: OdieAllowedBots;
	botSetting?: string;
	chat: Chat;
	clearChat: () => void;
	initialUserMessage: string | null | undefined;
	isLoadingChat: boolean;
	isLoading: boolean;
	isNudging: boolean;
	isVisible: boolean;
	lastNudge: Nudge | null;
	lastUserLocations: OdieUserTracking[];
	onChatLoaded?: () => void;
	sendNudge: ( nudge: Nudge ) => void;
	setChat: ( chat: Chat ) => void;
	setIsLoadingChat: ( isLoadingChat: boolean ) => void;
	setMessageLikedStatus: ( message: Message, liked: boolean ) => void;
	setContext: ( context: Context ) => void;
	setIsNudging: ( isNudging: boolean ) => void;
	setIsVisible: ( isVisible: boolean ) => void;
	setIsLoading: ( isLoading: boolean ) => void;
	setOnChatLoaded: ( onChatLoaded: () => void ) => void;
	trackEvent: ( event: string, properties?: Record< string, unknown > ) => void;
}

const defaultContextInterfaceValues = {
	addMessage: noop,
	botName: 'Wapuu',
	botNameSlug: null,
	chat: { context: { section_name: '', site_id: null }, messages: [] },
	clearChat: noop,
	initialUserMessage: null,
	isLoadingChat: false,
	isLoading: false,
	isNudging: false,
	isVisible: false,
	lastNudge: null,
	lastUserLocations: [],
	onChatLoaded: noop,
	sendNudge: noop,
	setChat: noop,
	setIsLoadingChat: noop,
	setMessageLikedStatus: noop,
	setContext: noop,
	setIsNudging: noop,
	setIsVisible: noop,
	setIsLoading: noop,
	setOnChatLoaded: noop,
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
	botNameSlug = null,
	botSetting = 'wapuu',
	initialUserMessage,
	children,
}: {
	botName?: string;
	botNameSlug: OdieAllowedBots;
	botSetting?: string;
	initialUserMessage?: string | null | undefined;
	children?: ReactNode;
} ) => {
	const dispatch = useDispatch();
	const odieIsEnabled = config.isEnabled( 'wapuu' );
	const lastUserLocations = useOdieUserTracking();

	const [ isVisible, setIsVisible ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isNudging, setIsNudging ] = useState( false );
	const [ lastNudge, setLastNudge ] = useState< Nudge | null >( null );
	const [ onChatLoaded, setOnChatLoaded ] = useState< () => void >( noop );

	const existingChatIdString = useOdieStorage( 'chat_id' );
	const existingChatId = existingChatIdString ? parseInt( existingChatIdString, 10 ) : null;
	const existingChat = useLoadPreviousChat( botNameSlug, existingChatId, onChatLoaded );

	const [ chat, setChat ] = useState< Chat >( existingChat );

	useEffect( () => {
		setChat( existingChat );
	}, [ existingChat ] );

	const clearChat = useCallback( () => {
		clearOdieStorage( 'chat_id' );
		setChat( {
			chat_id: null,
			messages: [ getOdieInitialMessage( botNameSlug ) ],
		} );
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

	const addMessage = ( message: Message ) => {
		setChat( ( prevChat ) => ( {
			...prevChat,
			messages:
				prevChat.messages[ prevChat.messages.length - 1 ].type === 'placeholder'
					? [ ...prevChat.messages.slice( 0, -1 ), message ]
					: [ ...prevChat.messages, message ],
		} ) );
	};

	if ( ! odieIsEnabled ) {
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
				initialUserMessage,
				isLoadingChat: false,
				isLoading: isLoading,
				isNudging,
				isVisible,
				lastNudge,
				lastUserLocations,
				onChatLoaded: noop,
				sendNudge: setLastNudge,
				setChat,
				setIsLoadingChat: noop,
				setMessageLikedStatus,
				setContext: noop,
				setIsLoading,
				setIsNudging,
				setIsVisible,
				setOnChatLoaded,
				trackEvent,
			} }
		>
			{ children }
		</OdieAssistantContext.Provider>
	);
};

export { OdieAssistantContext, OdieAssistantProvider, useOdieAssistantContext };
