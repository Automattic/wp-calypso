// Re-export store types as the single source of truth
export type {
	AgentChatConfig,
	AgentChatState,
	AgentConfig,
	AgentOptions,
	AuthProvider,
	ContextProvider,
	Message,
	ToolProvider,
} from '../store/types';

// Import types for local use
import type {
	AuthProvider,
	ContextProvider,
	ToolProvider,
} from '../store/types';

// Constants
export const DEFAULT_PLACEHOLDER = 'Ask anything' as const;

// Additional public types for component props
export interface AgentChatProps {
	agentId: string;
	agentUrl?: string;
	sessionId?: string;
	contextProvider?: ContextProvider;
	toolProvider?: ToolProvider;
	authProvider?: AuthProvider;
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
	chatState?: ChatState;
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
export interface ChatProps {
	variant?: 'floating' | 'embedded';
	triggerIcon?: React.ReactNode;
	placeholder?: string;
	notice?: NoticeConfig;
	onOpen?: () => void;
	onExpand?: () => void;
	onClose?: () => void;
	emptyView?: React.ReactNode;
	chatState?: ChatState;
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
