import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export type Context = {
	section_name?: string;
	session_id?: string;
	// etc
};

export type Nudge = {
	nudge: string;
	initialMessage: string;
	context?: Record< string, unknown >;
};

export type MessageRole = 'user' | 'bot';

export type MessageType = 'message' | 'action' | 'meta' | 'error';

export type Message = {
	content: string;
	role: MessageRole;
	type: MessageType;
	chat_id?: string | null;
};

export type Chat = {
	chat_id?: string | null;
	messages: Message[];
	context: Context;
};

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
	chat: { context: { section_name: '' }, messages: [] },
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
	const [ lastNudge, setLastNudge ] = useState< Nudge | null >( null );
	const [ messages, setMessages ] = useState< Message[] >( [] );
	const [ chat, setChat ] = useState< Chat >( {
		context: { section_name: sectionName },
		messages,
	} );

	const addMessage = ( message: Message ) => {
		setMessages( ( prevMessages ) => {
			const newMessages = [ ...prevMessages, message ];
			setChat( ( prevChat ) => ( {
				chat_id: message.chat_id ?? prevChat.chat_id,
				messages: newMessages,
				context: prevChat.context,
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
