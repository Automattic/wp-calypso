export type Context = {
	nudge_id?: string | undefined;
	section_name?: string;
	session_id?: string;
	site_id: number | null;
	// etc
};

export type Nudge = {
	nudge: string;
	initialMessage: string;
	context?: Record< string, unknown >;
};

export type MessageRole = 'user' | 'bot';

export type MessageType = 'message' | 'action' | 'meta' | 'error' | 'placeholder';

export type Message = {
	content: string;
	role: MessageRole;
	type: MessageType;
};

export type Chat = {
	chat_id?: string | null;
	messages: Message[];
	context: Context;
};

export type OdieAllowedSectionNames =
	| 'plans'
	| 'add-ons'
	| 'domains'
	| 'email'
	| 'site-purchases'
	| 'checkout';

export type OdieAllowedBots = 'wapuu';
