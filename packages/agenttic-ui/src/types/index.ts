// UI package should not import agent communication types
import type { ComponentType } from 'react';
import type { ChatPosition } from '../utils/chatStorage';

// Define UI-specific types locally
export interface SuggestionOption {
	id: string;
	label: string;
	value: string; // Appended to the parent suggestion's prompt with boundary whitespace normalized
}

export interface Suggestion {
	id: string;
	label: string;
	prompt?: string;
	action?: () => boolean | Promise< boolean >;
	autoSubmit?: boolean; // When true, clicking the suggestion automatically submits it to the LLM
	options?: SuggestionOption[]; // When present, renders as a dropdown picker
}

export interface Message {
	id: string;
	role: 'user' | 'agent';
	content: Array< {
		type: 'text' | 'component' | 'context' | 'data';
		text?: string;
		component?: React.ComponentType;
		componentProps?: any;
		data?: Record< string, unknown >;
	} >;
	timestamp: number;
	archived: boolean;
	showIcon: boolean;
	icon?: string;
	actions?: MessageAction[];
	disabled?: boolean;
	reactKey?: string; // Stable key for React rendering (prevents unmount/remount during updates)
}

export interface MessageActionButton {
	type?: 'button';
	id: string;
	icon?: React.ReactNode;
	label: string;
	onClick: ( message: Message ) => void | Promise< void >;
	tooltip?: string;
	disabled?: boolean;
	pressed?: boolean;
	showLabel?: boolean;
	order?: number;
}

export interface MessageActionComponent {
	type: 'component';
	id: string;
	label?: string;
	component: React.ComponentType< any >;
	componentProps?: Record< string, unknown >;
	order?: number;
}

export type MessageAction = MessageActionButton | MessageActionComponent;

// UI package only exports UI-specific types

// UI component props - no agent communication concerns
export interface AgentUIProps {
	// Core data from agent hook
	messages: Message[];
	isProcessing: boolean;
	error?: string | null;
	onSubmit: ( message: string ) => void | Promise< void >;

	// UI-specific props
	className?: string;
	style?: React.CSSProperties;
	variant?: 'floating' | 'embedded';
	triggerIcon?: React.ReactNode;
	triggerTitle?: string; // Title shown next to the icon in the 'minimized' state (defaults to 'Ask AI')
	placeholder?: string | string[];
	notice?: NoticeConfig;
	onOpen?: () => void;
	onExpand?: () => void;
	onClose?: () => void;
	onStop?: () => void; // Optional callback to stop current request
	emptyView?: React.ReactNode;
	floatingChatState?: ChatState;
	suggestions?: Suggestion[];
	clearSuggestions?: () => void;
	onSuggestionClick?: (
		selectedSuggestion: Suggestion,
		availableSuggestions: Suggestion[]
	) => void;
	messageRenderer?: ComponentType< { children: string } >;
	messagesPosition?: 'top' | 'bottom';
	// Render an avatar next to agent text responses. Defaults to false; when
	// false no icon is shown, preserving the prior behaviour. Individual
	// messages still control eligibility via their `showIcon` flag.
	showAgentIcon?: boolean;
	expandOnClick?: boolean;
	expandOnHover?: boolean;

	// Controlled input props (optional)
	inputValue?: string;
	onInputChange?: ( value: string ) => void;

	// Drag and drop props
	draggableStates?: ChatState[]; // Specify which chat states allow dragging (defaults to ['expanded'] for backward compatibility)

	// i18n
	locale?: string; // Language locale (e.g., 'es', 'fr', 'de-DE'). Defaults to 'en'

	// Input validation
	maxInputLength?: number; // Maximum character limit for input (defaults to 600)
	onInputLimitExceeded?: () => void; // Callback when input exceeds max length

	// Thinking message customization
	thinkingMessage?: string; // Custom text to display when the agent is processing (defaults to "Thinking…")

	// Chat position props
	initialChatPosition?: ChatPosition;
	onChatPositionChange?: ( position: ChatPosition ) => void;

	// Typing status callback
	onTypingStatusChange?: ( isTyping: boolean ) => void;
}

export interface NoticeConfig {
	icon?: React.ReactNode | null | false;
	message: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	dismissible?: boolean;
	onDismiss?: () => void;
	status?: 'success' | 'warning' | 'error';
}

// UI-specific types for existing components
export interface ChatProps extends AgentUIProps {
	floatingChatState?: ChatState;
}

export type ChatState = 'collapsed' | 'minimized' | 'compact' | 'expanded';

// Hook Types
export interface UseChatReturn {
	state: ChatState;
	initialState: ChatState;
	setState: ( state: ChatState ) => void;
	isOpen: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
}

export interface UseInputReturn {
	value: string;
	setValue: ( value: string ) => void;
	clear: () => void;
	textareaRef: React.RefObject< HTMLTextAreaElement >;
	handleKeyDown: ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => void;
	adjustHeight: () => void;
}
