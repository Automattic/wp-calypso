export interface Message {
	id: string;
	role: 'user' | 'assistant' | 'error';
	content: Array< {
		type: 'text' | 'image_url' | 'component';
		text?: string;
		image_url?: string;
		component?: React.ComponentType;
		componentProps?: any;
	} >;
	created_at: number;
	archived: boolean;
	showIcon: boolean;
	icon?: string;
}

export interface Suggestion {
	id: string;
	label: string;
	prompt: string;
}

// Import markdown types
import type { Components } from 'react-markdown';
import type { MarkdownExtensions } from '../markdown-extensions';

export interface AgentChatState {
	messages: Message[];
	isThinking: boolean;
	isSendingMessage: boolean;
	isTyping: boolean;
	messagesToDelete: Message[];
	assistant: string;
	pendingToolCallbacks: number;
	currentToolCall: string;
	error: string | null;
	suggestions: Suggestion[];
	inputValue: string;
	markdownComponents: Components;
	markdownExtensions: MarkdownExtensions;
}

export interface AgentConfig {
	agentId: string;
	agentUrl: string;
	sessionId: string;
}

export interface AgentOptions {
	withHistory?: boolean;
	agentKey?: string;
	sessionId?: string;
}

export interface ContextProvider {
	getClientContext: () => any;
}

export interface ToolProvider {
	getAvailableTools: () => Promise< any[] >;
	executeTool: (
		toolId: string,
		args: any,
		messageId: string,
		toolCallId: string
	) => Promise< any >;
}

export interface AuthProvider {
	(): Promise< Record< string, string > >;
}

export interface AgentChatConfig {
	agentConfig: AgentConfig;
	contextProvider?: ContextProvider;
	toolProvider?: ToolProvider;
	authProvider?: AuthProvider;
}

// Store type definitions
export interface StoreSelectors {
	getMessages: () => Message[];
	getIsThinking: () => boolean;
	getIsSendingMessage: () => boolean;
	getIsTyping: () => boolean;
	getMessagesToDelete: () => Message[];
	getAssistant: () => string;
	getPendingToolCallbacks: () => number;
	getCurrentToolCall: () => string;
	getError: () => string | null;
	getLastMessage: () => Message | null;
	getUserMessages: () => Message[];
	getAssistantMessages: () => Message[];
	getConversationHistory: () => Message[];
	getRegisteredSuggestions: () => Suggestion[];
	getInputValue: () => string;
	getRegisteredMarkdownComponents: () => Components;
	getRegisteredMarkdownExtensions: () => MarkdownExtensions;
}

export interface StoreActions {
	setMessages: ( messages: Message[] ) => void;
	addMessage: ( message: Message ) => void;
	deleteMessage: ( id: string ) => void;
	clearMessages: () => void;
	setThinking: ( isThinking: boolean ) => void;
	setIsSendingMessage: ( isSendingMessage: boolean ) => void;
	setIsTyping: ( isTyping: boolean ) => void;
	setAssistant: ( assistant: string ) => void;
	setPendingToolCallbacks: ( count: number ) => void;
	setCurrentToolCall: ( toolCall: string ) => void;
	setError: ( error: string | null ) => void;
	addMessageToDelete: ( message: Message ) => void;
	clearMessagesToDelete: () => void;
	registerSuggestions: ( suggestions: Suggestion[] ) => void;
	clearSuggestions: () => void;
	setInputValue: ( value: string ) => void;
	clearInputValue: () => void;
	registerMarkdownComponents: ( components: Components ) => void;
	registerMarkdownExtensions: ( extensions: MarkdownExtensions ) => void;
	clearMarkdownComponents: () => void;
	clearMarkdownExtensions: () => void;
}
