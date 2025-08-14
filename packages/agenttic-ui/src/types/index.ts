// UI package should not import agent communication types
import type { ComponentType } from 'react';
import { __ } from '@wordpress/i18n';

// Define UI-specific types locally
export interface Suggestion {
	id: string;
	label: string;
	prompt: string;
}

export interface Message {
	id: string;
	role: 'user' | 'agent';
	content: Array< {
		type: 'text' | 'image_url' | 'component';
		text?: string;
		image_url?: string;
		component?: React.ComponentType;
		componentProps?: any;
	} >;
	timestamp: number;
	archived: boolean;
	showIcon: boolean;
	icon?: string;
	actions?: MessageAction[];
}

export interface MessageAction {
	id: string;
	icon: React.ReactNode;
	label: string;
	onClick: ( message: Message ) => void | Promise< void >;
	tooltip?: string;
	disabled?: boolean;
}

// UI package only exports UI-specific types

// Constants
export const DEFAULT_PLACEHOLDER = __( 'Ask anything', 'a8c-agenttic' );

// UI component props - no agent communication concerns
export interface AgentUIProps {
	// Core data from agent hook
	messages: Message[];
	isProcessing: boolean;
	error?: string | null;
	onSubmit: ( message: string ) => void;

	// UI-specific props
	className?: string;
	style?: React.CSSProperties;
	variant?: 'floating' | 'embedded';
	triggerIcon?: React.ReactNode;
	placeholder?: string;
	notice?: NoticeConfig;
	onOpen?: () => void;
	onExpand?: () => void;
	onClose?: () => void;
	emptyView?: React.ReactNode;
	floatingChatState?: ChatState;
	suggestions?: Suggestion[];
	clearSuggestions?: () => void;
	messageRenderer?: ComponentType< { children: string } >;
}

export interface NoticeConfig {
	icon?: React.ReactNode;
	message: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	dismissible?: boolean;
	onDismiss?: () => void;
}

// UI-specific types for existing components
export interface ChatProps extends AgentUIProps {
	floatingChatState?: ChatState;
}

export type ChatState = 'collapsed' | 'compact' | 'expanded';

// Hook Types
export interface UseChatReturn {
	state: ChatState;
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
