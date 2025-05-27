export interface CLIOptions {
	url: string;
	message?: string;
	token?: string;
	session?: string;
	stream?: boolean;
	interactive?: boolean;
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

export interface ConversationHistoryItem {
	role: 'user' | 'model';
	text: string;
}

export interface InteractiveSession {
	sessionId: string;
	messageCount: number;
	conversationHistory: ConversationHistoryItem[];
}
