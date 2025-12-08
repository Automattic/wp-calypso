export type ZendeskConfigName =
	| 'zendesk_support_chat_key'
	| 'zendesk_presales_chat_key'
	| 'zendesk_presales_chat_key_akismet'
	| 'zendesk_presales_chat_key_jp_checkout'
	| 'zendesk_presales_chat_key_jp_agency_dashboard';

export type APIFetchOptions = {
	global: boolean;
	path: string;
};

export type UserFields = {
	messaging_ai_chat_id?: string | number;
	messaging_initial_message?: string;
	messaging_plan?: string;
	messaging_source?: string | null;
	messaging_url?: string | null;
	messaging_flow?: string | null;
	/**
	 * Site ID of the site the user is currently on.
	 */
	messaging_site_id: string | number | null;
};

export interface ConversationParticipant {
	id: string;
	userId: string;
	unreadCount: number;
	lastRead: number;
}

export type MessagingAuth = {
	user: {
		external_id?: string;
		jwt: string;
	};
};

export type MessagingAvailability = {
	is_available: boolean;
};

export type MessagingGroup = 'jp_presales' | 'wpcom_messaging' | 'wpcom_presales';

export type MessagingMetadata = {
	aiChatId?: string;
	message?: string;
	siteUrl?: string;
	siteId?: string | number | null;
	onError?: () => void;
	onSuccess?: () => void;
};

export type ZendeskAuthType = 'zendesk' | 'messenger';

export type ChatFeedbackActions = {
	score: string;
	account_id: number;
	ticket_id: number;
};

export type MessageAction = {
	id: string;
	payload: boolean;
	text: string;
	type: string;
	metadata: ChatFeedbackActions;
	label: string;
	onClick: () => void;
};

export type ZendeskContentType =
	| 'text'
	| 'carousel'
	| 'file'
	| 'form'
	| 'formResponse'
	| 'image'
	| 'image-placeholder'
	| 'list'
	| 'location'
	| 'template';

export type ZendeskMessage = {
	received: number;
	role: 'user' | 'business';
	text: string;
	altText?: string;
	avatarUrl?: string;
	id: string;
	actions?: MessageAction[];
	source?: {
		type: 'web' | 'slack' | 'zd:surveys' | 'zd:answerBot';
		id: string;
		integrationId: string;
	};
	type: ZendeskContentType;
	mediaUrl?: string;
	metadata?: Record< string, any >;
	htmlText?: string;
};

export type ZendeskConversation = {
	id: string;
	lastUpdatedAt: number;
	businessLastRead: number;
	description: string;
	displayName: string;
	iconUrl: string;
	type: 'sdkGroup' | string;
	participants: ConversationParticipant[];
	messages: ZendeskMessage[];
	metadata: {
		[ key: string ]: string | number | boolean;
	};
};

export type ZendeskMessageRole = 'user' | 'business';

export type MessageType =
	| 'message'
	| 'action'
	| 'meta'
	| 'error'
	| 'placeholder'
	| 'dislike-feedback'
	| 'conversation-feedback'
	| 'help-link'
	| 'file'
	| 'image'
	| 'image-placeholder'
	| 'introduction'
	| 'form'
	| 'formResponse';

/**
 * Agenttic-UI Message interface
 * Used for components that require the standardized Message interface
 */
export interface AgentticMessage {
	id: string;
	role: 'user' | 'agent';
	content: Array< {
		type: 'text' | 'image_url' | 'component' | 'context';
		text?: string;
		image_url?: string;
		component?: React.ComponentType;
		componentProps?: unknown;
	} >;
	timestamp: number;
	archived: boolean;
	showIcon: boolean;
	icon?: string;
	actions?: MessageAction[];
	disabled?: boolean;
}
