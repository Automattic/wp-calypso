import config from '@automattic/calypso-config';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import OdieAssistant from '..';
import useOdieUserTracking from '../trackLocation/useOdieUserTracking';
import { getOdieInitialMessages } from './initial-messages';
import { getOdieInitialPrompt } from './initial-prompts';
import type { OdieUserTracking } from '../trackLocation/useOdieUserTracking';
import type { Chat, Context, Message, Nudge, OdieAllowedSectionNames } from '../types';
import type { HelpCenterSelect } from '@automattic/data-stores';
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
	isHelpCenterVisible: boolean;
	isLoadingChat: boolean;
	isLoading: boolean;
	isNudging: boolean;
	isVisible: boolean;
	lastNudge: Nudge | null;
	lastUserLocations: OdieUserTracking[];
	onContactUs: () => void;
	onSearchDoc: () => void;
	sendNudge: ( nudge: Nudge ) => void;
	setChat: ( chat: Chat ) => void;
	setIsLoadingChat: ( isLoadingChat: boolean ) => void;
	setMessages: ( messages: Message[] ) => void;
	setContext: ( context: Context ) => void;
	setIsNudging: ( isNudging: boolean ) => void;
	setIsVisible: ( isVisible: boolean ) => void;
	setIsLoading: ( isLoading: boolean ) => void;
	setIsHelpCenterVisible: ( isHelpCenterVisible: boolean ) => void;
	trackEvent: ( event: string, properties?: Record< string, unknown > ) => void;
}

const defaultContextInterfaceValues = {
	addMessage: noop,
	botName: 'Wapuu',
	botNameSlug: 'wapuu',
	chat: { context: { section_name: '', site_id: null }, messages: [] },
	clearChat: noop,
	isHelpCenterVisible: false,
	isLoadingChat: false,
	isLoading: false,
	isNudging: false,
	isVisible: false,
	lastNudge: null,
	lastUserLocations: [],
	onContactUs: noop,
	onSearchDoc: noop,
	sendNudge: noop,
	setChat: noop,
	setIsLoadingChat: noop,
	setMessages: noop,
	setContext: noop,
	setIsNudging: noop,
	setIsVisible: noop,
	setIsLoading: noop,
	setIsHelpCenterVisible: noop,
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
	helpCenter = null,
	botName = 'Wapuu assistant',
	botNameSlug = 'wapuu',
	botSetting = 'wapuu',
	sectionName,
	children,
}: {
	helpCenter?: ReactNode;
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
	const [ isHelpCenterVisible, setIsHelpCenterVisible ] = useState( false );
	const [ isVisible, setIsVisible ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isNudging, setIsNudging ] = useState( false );
	const [ lastNudge, setLastNudge ] = useState< Nudge | null >( null );
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
	}, [ sectionName, siteId, botSetting ] );

	const trackEvent = ( event: string, properties?: Record< string, unknown > ) => {
		dispatch( recordTracksEvent( event, properties ) );
	};

	const helpCenterVisible =
		useDateStoreSelect(
			( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
			[]
		) ?? false;

	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );
	const { setInitialRoute } = useDataStoreDispatch( HELP_CENTER_STORE );

	const onSearchDoc = () => {
		setIsHelpCenterVisible( true );
		setShowHelpCenter( true );
		setInitialRoute( '/' );
	};

	const onContactUs = () => {
		setIsHelpCenterVisible( true );
		setShowHelpCenter( true );
		setInitialRoute( '/contact-options' );
	};

	const visibility = sectionName === 'help-center' ? helpCenterVisible : isVisible;
	const setVisibility = sectionName === 'help-center' ? setShowHelpCenter : setIsVisible;

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
				chat,
				clearChat,
				isLoadingChat: false,
				isLoading: isLoading,
				isNudging,
				isVisible: visibility,
				lastNudge,
				lastUserLocations,
				onContactUs,
				onSearchDoc,
				sendNudge: setLastNudge,
				setChat,
				setIsLoadingChat: noop,
				setMessages,
				setContext: noop,
				setIsLoading,
				setIsNudging,
				setIsVisible: setVisibility,
				isHelpCenterVisible,
				setIsHelpCenterVisible,
				trackEvent,
				botSetting,
			} }
		>
			{ children }

			{ odieIsEnabled && (
				<OdieAssistant
					botNameSlug={ botNameSlug }
					helpCenter={ helpCenter }
					simple={ botSetting === 'supportDocs' }
				/>
			) }
		</OdieAssistantContext.Provider>
	);
};

export { OdieAssistantContext, OdieAssistantProvider, useOdieAssistantContext };
