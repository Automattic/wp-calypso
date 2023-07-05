import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

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
};

export type Chat = {
	chatId?: string | null;
	messages: Message[];
};

interface OdysseusAssistantContextInterface {
	addMessage: (
		content: string,
		role: MessageRole,
		type: MessageType,
		chatId?: string | null
	) => void;
	chat: Chat;
	isLoadingChat: boolean;
	lastNudge: Nudge | null;
	messages: Message[];
	sectionName: string;
	sendNudge: ( nudge: Nudge ) => void;
	setChat: ( chat: Chat ) => void;
	setIsLoadingChat: ( isLoadingChat: boolean ) => void;
	setMessages: ( messages: Message[] ) => void;
}

const defaultContextInterfaceValues = {
	addMessage: noop,
	chat: { messages: [] },
	isLoadingChat: false,
	lastNudge: null,
	messages: [],
	sectionName: '',
	sendNudge: noop,
	setChat: noop,
	setIsLoadingChat: noop,
	setMessages: noop,
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
	const [ chat, setChat ] = useState< Chat >( { messages: [] } );

	const addMessage = (
		content: string,
		role: MessageRole,
		type: MessageType,
		chatId?: string | null
	) => {
		setMessages( ( prevMessages ) => {
			const newMessages = [ ...prevMessages, { content, role, type } as Message ];
			setChat( ( prevChat ) => ( {
				chatId: chatId ?? prevChat.chatId,
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
				messages,
				sectionName,
				sendNudge: setLastNudge,
				setChat,
				setIsLoadingChat: noop,
				setMessages,
			} }
		>
			{ children }
		</OdysseusAssistantContext.Provider>
	);
};

export { OdysseusAssistantContext, OdysseusAssistantProvider, useOdysseusAssistantContext };
