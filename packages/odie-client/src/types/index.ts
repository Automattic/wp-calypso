import type { OdieUserTracking } from '../track-location/useOdieUserTracking';

export type Source = {
	title: string;
	url: string;
	heading: string;
	blog_id: number;
	post_id: number;
	content: string;
	railcar?: {
		ui_position: number;
		ui_algo: string;
		fetch_algo: string;
		fetch_position: number;
		railcar: string;
	};
};

export type CurrentUser = {
	display_name: string;
	avatar_URL?: string;
	email?: string;
	id?: number;
};

type Feature =
	| 'login'
	| 'logout'
	| 'theme'
	| 'plugin'
	| 'admin'
	| 'site-editing'
	| 'domain'
	| 'email'
	| 'subscription'
	| 'notification'
	| 'podcast'
	| 'facebook'
	| 'unrelated-to-wordpress';

type InquiryType =
	| 'help'
	| 'suggestion'
	| 'refund'
	| 'billing'
	| 'unrelated-to-wordpress'
	| 'request-for-human-support';

export type Context = {
	nudge_id?: string | undefined;
	section_name?: string;
	session_id?: string;
	site_id: number | null;
	user_tracking?: OdieUserTracking[];
	sources?: Source[];
	prompt_tags?: {
		feature?: Feature;
		inquiry_type?: InquiryType;
		language?: string;
		product?: string;
	};
	flags?: {
		forward_to_human_support?: boolean;
		canned_response?: boolean;
		hide_disclaimer_content?: boolean;
		show_contact_support_msg?: boolean;
	};
};

export type Nudge = {
	nudge: string;
	initialMessage: string;
	context?: Record< string, unknown >;
};

export type MessageRole = 'user' | 'bot' | 'business';

export type MessageType =
	| 'message'
	| 'action'
	| 'meta'
	| 'error'
	| 'placeholder'
	| 'dislike-feedback'
	| 'help-link'
	| 'introduction';

export type Message = {
	content: string;
	context?: Context;
	internal_message_id?: string;
	message_id?: number;
	meta?: Record< string, string >;
	liked?: boolean | null;
	rating_value?: number;
	role: MessageRole;
	simulateTyping?: boolean;
	type: MessageType;
	directEscalationSupport?: boolean;
	created_at?: string;
};

export type Chat = {
	conversationId?: string;
	chat_id?: number | null;
	messages: Message[];
};

export type OdieAllowedSectionNames =
	| 'plans'
	| 'add-ons'
	| 'domains'
	| 'email'
	| 'site-purchases'
	| 'checkout'
	| 'help-center';

export const odieAllowedBots = [ 'wpcom-support-chat', 'wpcom-plan-support' ] as const;

export type OdieAllowedBots = ( typeof odieAllowedBots )[ number ];

export type SupportProvider = 'zendesk' | 'odie';
interface ConversationParticipant {
	id: string;
	userId: string;
	unreadCount: number;
	lastRead: number;
}

export type ZendeskMessage = {
	avatarUrl: string;
	displayName: string;
	id: string;
	metadata: Metadata;
	received: number;
	role: string;
	source: {
		type: 'web' | 'slack';
		id: string;
		integrationId: string;
	};
	type: ZendeskContentType;
	text: string;
};

export type ZendeskContentType =
	| 'text'
	| 'carousel'
	| 'file'
	| 'form'
	| 'formResponse'
	| 'image'
	| 'list'
	| 'location'
	| 'template';

export type ZendeskConversation = {
	id: string;
	lastUpdatedAt: number;
	businessLastRead: number;
	description: string;
	displayName: string;
	iconUrl: string;
	type: 'sdkGroup' | string;
	participants: ConversationParticipant[];
	metadata: Metadata;
	messages: ZendeskMessage[];
};
