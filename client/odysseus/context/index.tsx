import { createContext, useContext, useState } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { Chat, Context, Message, Nudge } from '../types';
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
interface OdysseusAssistantContextInterface {
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
};

// Create a default new context
const OdysseusAssistantContext = createContext< OdysseusAssistantContextInterface >(
	defaultContextInterfaceValues
);

// Custom hook to access the OdysseusAssistantContext
const useOdysseusAssistantContext = () => useContext( OdysseusAssistantContext );

// Create a provider component for the context
const OdysseusAssistantProvider = ( {
	sectionName,
	children,
}: {
	sectionName: string;
	children: ReactNode;
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const [ isVisible, setIsVisible ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isNudging, setIsNudging ] = useState( false );
	const [ lastNudge, setLastNudge ] = useState< Nudge | null >( null );
	const [ messages, setMessages ] = useState< Message[] >( [
		{ content: 'Hello, I am Wapuu! Your personal assistant.', role: 'bot', type: 'message' },
	] );
	const [ chat, setChat ] = useState< Chat >( {
		context: { section_name: sectionName, site_id: siteId },
		messages,
	} );

	const addMessage = ( message: Message ) => {
		setMessages( ( prevMessages ) => {
			const newMessages = [ ...prevMessages, message ];
			setChat( ( prevChat ) => ( {
				...prevChat,
				messages: newMessages,
			} ) );
			return newMessages;
		} );
	};

	return (
		<OdysseusAssistantContext.Provider
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
			} }
		>
			{ children }
		</OdysseusAssistantContext.Provider>
	);
};

export { OdysseusAssistantContext, OdysseusAssistantProvider, useOdysseusAssistantContext };
