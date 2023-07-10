import { createContext, useContext, useState } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { Chat, Context, Message, Nudge } from '../types';
import type { ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface OdysseusAssistantContextInterface {
	addMessage: ( message: Message ) => void;
	chat: Chat;
	isLoadingChat: boolean;
	lastNudge: Nudge | null;
	sendNudge: ( nudge: Nudge ) => void;
	setChat: ( chat: Chat ) => void;
	setIsLoadingChat: ( isLoadingChat: boolean ) => void;
	setMessages: ( messages: Message[] ) => void;
	setContext: ( context: Context ) => void;
}

const defaultContextInterfaceValues = {
	addMessage: noop,
	chat: { context: { section_name: '', site_id: null }, messages: [] },
	isLoadingChat: false,
	lastNudge: null,
	sendNudge: noop,
	setChat: noop,
	setIsLoadingChat: noop,
	setMessages: noop,
	setContext: noop,
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
				lastNudge,
				sendNudge: setLastNudge,
				setChat,
				setIsLoadingChat: noop,
				setMessages,
				setContext: noop,
			} }
		>
			{ children }
		</OdysseusAssistantContext.Provider>
	);
};

export { OdysseusAssistantContext, OdysseusAssistantProvider, useOdysseusAssistantContext };
