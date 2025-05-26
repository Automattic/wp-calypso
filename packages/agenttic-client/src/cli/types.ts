export interface CLIOptions {
	url: string;
	token?: string;
	session?: string;
	stream?: boolean;
	interactive?: boolean;
	timeout?: number;
	verbose?: boolean;
	auth?: boolean;
	proxy?: string;
}

export interface CLIAuthOptions {
	token?: string;
	// Future: support for other auth methods like API keys, OAuth, etc.
}

export interface InteractiveSession {
	sessionId: string;
	messageCount: number;
}
