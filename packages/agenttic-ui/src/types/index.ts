// UI package should not import agent communication types
import type { ComponentType } from 'react';
import type { ChatPosition } from '../utils/chatStorage';

// Define UI-specific types locally
export interface ChatSize {
	width: number;
	height: number;
}

export interface SuggestionOption {
	id: string;
	label: string;
	value: string; // Appended to the parent suggestion's prompt with boundary whitespace normalized
}

export interface Suggestion {
	id: string;
	label: string;
	description?: string;
	prompt?: string;
	action?: () => boolean | Promise< boolean >;
	autoSubmit?: boolean; // When true, clicking the suggestion automatically submits it to the LLM
	options?: SuggestionOption[]; // When present, renders as a dropdown picker
}

export interface QuestionChoice {
	label: string;
	message?: string;
	description?: string;
	presentation?: unknown;
}

export interface QuestionPrompt {
	question: string;
	choices: QuestionChoice[];
}

// Agent message source/citation. Mirrors AgentsApiSource from
// @automattic/agenttic-client so the UI package stays free of agent
// communication imports.
export interface AgentSource {
	id?: string;
	title?: string;
	url?: string;
	label?: string;
	metadata?: Record< string, unknown >;
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
	sources?: AgentSource[]; // Agent message sources/citations rendered beneath the body
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
	onSubmit: ( message: string, files?: File[] ) => void | Promise< void >;

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
	onSuggestionsRendered?: ( shown: Suggestion[] ) => void;
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
	freeDrag?: boolean; // Keep the panel where dropped instead of snapping to a corner (position is ephemeral, resets on reload/resize)
	initialFreeDragPosition?: { x: number; y: number }; // Seed the free-drag pixel position on mount (only applied when freeDrag is on)
	onFreeDragEnd?: ( position: { x: number; y: number } ) => void; // Reports the dropped free-drag pixel position so consumers can persist it

	// Resize props (honored only for variant="floating" in the expanded state).
	// The package stays stateless about persistence: defaultSize seeds the
	// initial size, onResizeEnd reports the committed size for the consumer to persist.
	resizable?: boolean | 'horizontal' | 'vertical'; // Enable resize of the expanded floating panel. true = both axes (all 8 handles), 'horizontal' = width only (left/right edges), 'vertical' = height only (top/bottom edges), false/omitted = off (defaults to false)
	defaultSize?: ChatSize; // Uncontrolled seed; falls back to { width: COMPACT_WIDTH, height: EXPANDED_HEIGHT }
	size?: ChatSize; // Controlled size; when set, the panel reconciles to it (animating when expanded). Undefined = uncontrolled defaultSize path
	minSize?: Partial< ChatSize >; // Floor; defaults to { width: 372, height: 520 } (today's size)
	maxSize?: Partial< ChatSize >; // Ceiling; clamped to the live constraint box. Defaults to the box itself
	onResize?: ( size: ChatSize ) => void; // Fires every pointermove frame for live reflow only — do NOT persist from here
	onResizeEnd?: ( size: ChatSize ) => void; // Fires once on pointer-up with the final committed size (the persistence hook)

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

	// Optional attachment controls for embedded consumers.
	allowAttachments?: boolean;
	acceptedFileTypes?: string[];
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
