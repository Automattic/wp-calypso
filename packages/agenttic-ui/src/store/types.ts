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
