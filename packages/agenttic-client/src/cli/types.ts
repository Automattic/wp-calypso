import type { Message } from '../client/types/index';

export interface CLIOptions {
	url: string;
	agentId: string;
	message?: string;
	token?: string;
	session?: string;
	stream?: boolean;
	timeout?: number;
	verbose?: boolean;
	auth?: boolean;
	proxy?: string;
	tools?: boolean;
	context?: boolean;
}

export interface CLIAuthOptions {
	token?: string;
	// Future: support for other auth methods like API keys, OAuth, etc.
}

// Conversation message type that stores complete A2A messages
export interface ConversationMessage {
	role: 'user' | 'agent';
	parts: Array< {
		type: 'text' | 'data';
		text?: string;
		data?: {
			// History message parts
			role?: 'user' | 'agent' | 'model';
			text?: string;
			// Tool call parts
			toolCallId?: string;
			toolId?: string;
			arguments?: Record< string, unknown >;
			// Tool result parts
			result?: any;
			// Other data parts
			[ key: string ]: any;
		};
	} >;
	timestamp?: string;
}

export interface InteractiveSession {
	sessionId: string;
	conversationMessages: Message[];
	messageCount: number;
}
