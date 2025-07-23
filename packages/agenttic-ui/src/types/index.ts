// Re-export store types as the single source of truth
export type {
	AgentChatConfig,
	AgentChatState,
	AgentConfig,
	AgentOptions,
	AuthProvider,
	ContextProvider,
	Message,
	Suggestion,
	StoreActions,
	StoreSelectors,
	ToolProvider,
} from '../store/types';

// Export react-markdown Components type
export type { Components } from 'react-markdown';

// Export markdown extensions types
export type { MarkdownExtensions } from '../markdown-extensions';

// Import types for local use
import type { Components } from 'react-markdown';
import type { MarkdownExtensions } from '../markdown-extensions';
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
