import React, { createContext, useCallback, useContext } from 'react';
import type { ComponentType } from 'react';
import type {
	ChatState,
	Message,
	NoticeConfig,
	Suggestion,
	UseInputReturn,
} from '../types';

export interface AgentUIContextValue {
	// Core data
	messages: Message[];
	isProcessing: boolean;
	error?: string | null;

	// Input state
	inputValue: string;
	setInputValue: ( value: string ) => void;
	clearInput: () => void;
	textareaRef: React.RefObject< HTMLTextAreaElement >;
	handleKeyDown: ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => void;

	// Actions
	onSubmit: ( message: string ) => void;
	handleSubmit: () => void;
	onStop?: () => void;

	// UI state
	variant: 'floating' | 'embedded';
	placeholder?: string | string[];
	emptyView?: React.ReactNode;
	messageRenderer?: ComponentType< { children: string } >;
	messagesPosition?: 'top' | 'bottom';
	showAgentIcon?: boolean;

	// Floating chat specific
	floatingChatState?: ChatState;
	triggerIcon?: React.ReactNode;
	onOpen?: () => void;
	onExpand?: () => void;
	onClose?: () => void;

	// Suggestions
	suggestions?: Suggestion[];
	clearSuggestions?: () => void;
	handleSuggestionSubmit: (
		selectedSuggestion: Suggestion,
		availableSuggestions: Suggestion[]
	) => void;

	// Notice
	notice?: NoticeConfig;

	// Thinking message
	thinkingMessage?: string;

	// Internal state for components
	focusOnMount?: boolean;
	fromCompact?: boolean;
	showExpandButton?: boolean;

	// Input validation
	isInputOverLimit?: boolean;

	// Focus handlers for typing status
	onInputFocus?: () => void;
	onInputBlur?: () => void;
}

const AgentUIContext = createContext< AgentUIContextValue | null >( null );

export function useAgentUIContext(): AgentUIContextValue {
	const context = useContext( AgentUIContext );
	if ( ! context ) {
		throw new Error(
			'useAgentUIContext must be used within an AgentUIContainer'
		);
	}
	return context;
}

export interface AgentUIProviderProps {
	children: React.ReactNode;
	value: AgentUIContextValue;
}

export function AgentUIProvider( { children, value }: AgentUIProviderProps ) {
	return (
		<AgentUIContext.Provider value={ value }>
			{ children }
		</AgentUIContext.Provider>
	);
}
