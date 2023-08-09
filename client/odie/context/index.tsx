import config from '@automattic/calypso-config';
import { createContext, useContext, useEffect, useState } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import OdieAssistant from '..';
import { getOdieInitialPrompt } from './initial-prompts';
import type { Chat, Context, Message, Nudge, OdieAllowedSectionNames } from '../types';
import type { ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

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
	chat: Chat;
	isLoadingChat: boolean;
	isLoading: boolean;
	isNudging: boolean;
	isVisible: boolean;
	lastNudge: Nudge | null;
	sendNudge: ( nudge: Nudge ) => void;
	setChat: ( chat: Chat ) => void;
	setIsLoadingChat: ( isLoadingChat: boolean ) => void;
	setMessages: ( messages: Message[] ) => void;
	setContext: ( context: Context ) => void;
	setIsNudging: ( isNudging: boolean ) => void;
	setIsVisible: ( isVisible: boolean ) => void;
	setIsLoading: ( isLoading: boolean ) => void;
	trackEvent: ( event: string, properties?: Record< string, unknown > ) => void;
}

const defaultContextInterfaceValues = {
	addMessage: noop,
	chat: { context: { section_name: '', site_id: null }, messages: [] },
	isLoadingChat: false,
	isLoading: false,
	isNudging: false,
	isVisible: false,
	lastNudge: null,
	sendNudge: noop,
	setChat: noop,
	setIsLoadingChat: noop,
	setMessages: noop,
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

const allowedTreatmentSections = [ 'plans' ];

// Create a provider component for the context
const OdieAssistantProvider = ( {
	sectionName,
	children,
}: {
	sectionName: OdieAllowedSectionNames;
	children: ReactNode;
} ) => {
	const dispatch = useDispatch();
	const [ , experimentAssignment ] = useExperiment( 'calypso_plans_wapuu_sales_agent_v0' );
	const odieIsEnabled =
		config.isEnabled( 'odie' ) ||
		( experimentAssignment?.variationName === 'treatment' &&
			allowedTreatmentSections.includes( sectionName ) );

	const siteId = useSelector( getSelectedSiteId );
	const [ isVisible, setIsVisible ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isNudging, setIsNudging ] = useState( false );
	const [ lastNudge, setLastNudge ] = useState< Nudge | null >( null );
	const [ messages, setMessages ] = useState< Message[] >( [
		{ content: getOdieInitialPrompt( sectionName ), role: 'bot', type: 'message' },
	] );
	const [ chat, setChat ] = useState< Chat >( {
		context: { section_name: sectionName, site_id: siteId },
		messages,
	} );

	useEffect( () => {
		setChat( {
			chat_id: null,
			context: { section_name: sectionName, site_id: siteId },
			messages: [ { content: getOdieInitialPrompt( sectionName ), role: 'bot', type: 'message' } ],
		} );
	}, [ sectionName, siteId ] );

	const trackEvent = ( event: string, properties?: Record< string, unknown > ) => {
		dispatch( recordTracksEvent( event, properties ) );
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
				chat,
				isLoadingChat: false,
				isLoading: isLoading,
				isNudging,
				isVisible,
				lastNudge,
				sendNudge: setLastNudge,
				setChat,
				setIsLoadingChat: noop,
				setMessages,
				setContext: noop,
				setIsLoading,
				setIsNudging,
				setIsVisible,
				trackEvent,
			} }
		>
			{ children }

			{ odieIsEnabled && <OdieAssistant botNameSlug="wapuu" /> }
		</OdieAssistantContext.Provider>
	);
};

export { OdieAssistantContext, OdieAssistantProvider, useOdieAssistantContext };
