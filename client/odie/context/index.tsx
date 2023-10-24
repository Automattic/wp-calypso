import config from '@automattic/calypso-config';
import { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import OdieAssistant from '..';
import useOdieUserTracking from '../track-location/useOdieUserTracking';
import { getOdieInitialMessages } from './initial-messages';
import { getOdieInitialPrompt } from './initial-prompts';
import type { OdieUserTracking } from '../track-location/useOdieUserTracking';
import type { Chat, Context, Message, Nudge, OdieAllowedSectionNames } from '../types';
import type { ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

/*
 * This is the interface for the context. It contains all the methods and values that are
 * available to the components that are wrapped in the provider.
 *
 * I've decided to manually set isLoading to have more control over the loading state.
 * The other option is to add the setIsLoading option to be part of the queries that are
 * used in the component. This would mean that the component would have to be aware of the
 * queries that are used in the component. I think this is a bit too much coupling. But the other
 * hand it's also a bit coupling to be setting manually the isLoading state.
 *
 */
interface OdieAssistantContextInterface {
	addMessage: ( message: Message ) => void;
	botName?: string;
	botNameSlug?: string;
	botSetting?: string;
	chat: Chat;
	clearChat: () => void;
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
	setMessages: ( messages: Message[] ) => void;
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
	botNameSlug: 'wapuu',
	chat: { context: { section_name: '', site_id: null }, messages: [] },
	clearChat: noop,
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
	setMessages: noop,
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
	botNameSlug = 'wapuu',
	botSetting = 'wapuu',
	sectionName,
	children,
}: {
	botName?: string;
	botNameSlug?: string;
	botSetting?: string;
	sectionName: OdieAllowedSectionNames;
	children?: ReactNode;
} ) => {
	const dispatch = useDispatch();
	const odieIsEnabled = config.isEnabled( 'wapuu' );
	const lastUserLocations = useOdieUserTracking();

	const siteId = useSelector( getSelectedSiteId );
	const [ isVisible, setIsVisible ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isNudging, setIsNudging ] = useState( false );
	const [ lastNudge, setLastNudge ] = useState< Nudge | null >( null );
	const [ onChatLoaded, setOnChatLoaded ] = useState< () => void >( noop );
	const [ messages, setMessages ] = useState< Message[] >( [
		{
			content: getOdieInitialPrompt( sectionName ),
			role: 'bot',
			type: botSetting === 'supportDocs' ? 'introduction' : 'message',
		},
		...getOdieInitialMessages( botSetting ),
	] );
	const [ chat, setChat ] = useState< Chat >( {
		context: { section_name: sectionName, site_id: siteId },
		messages,
	} );

	const clearChat = () => {
		setChat( {
			chat_id: null,
			context: { section_name: sectionName, site_id: siteId },
			messages: [
				{
					content: getOdieInitialPrompt( sectionName ),
					role: 'bot',
					type: botSetting === 'supportDocs' ? 'introduction' : 'message',
				},
				...getOdieInitialMessages( botSetting ),
			],
		} );
	};

	useEffect( () => {
		setChat( {
			chat_id: null,
			context: { section_name: sectionName, site_id: siteId },
			messages: [
				{
					content: getOdieInitialPrompt( sectionName ),
					role: 'bot',
					type: botSetting === 'supportDocs' ? 'introduction' : 'message',
				},
				...getOdieInitialMessages( botSetting ),
			],
		} );
		if ( onChatLoaded ) {
			onChatLoaded();
		}
	}, [ sectionName, siteId, botSetting, onChatLoaded ] );

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
		setMessages( ( prevMessages ) => {
			const lastMessage = prevMessages[ prevMessages.length - 1 ];
			// If the last message is placeholder type, replace it with the new message
			if ( lastMessage?.type === 'placeholder' ) {
				return [ ...prevMessages.slice( 0, -1 ), message ];
			}
			// Otherwise, add the new message
			return [ ...prevMessages, message ];
		} );

		setChat( ( prevChat ) => ( {
			...prevChat,
			messages:
				prevChat.messages[ prevChat.messages.length - 1 ].type === 'placeholder'
					? [ ...prevChat.messages.slice( 0, -1 ), message ]
					: [ ...prevChat.messages, message ],
		} ) );
	};

	return (
		<OdieAssistantContext.Provider
			value={ {
				addMessage,
				botName,
				botNameSlug,
				botSetting,
				chat,
				clearChat,
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
				setMessages,
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

			{ odieIsEnabled && <OdieAssistant botNameSlug={ botNameSlug } /> }
		</OdieAssistantContext.Provider>
	);
};

export { OdieAssistantContext, OdieAssistantProvider, useOdieAssistantContext };
