import type { OdieUserTracking } from '../track-location/useOdieUserTracking';

export type Source = {
	title: string;
	url: string;
	heading: string;
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
	};
};

export type Nudge = {
	nudge: string;
	initialMessage: string;
	context?: Record< string, unknown >;
};

export type MessageRole = 'user' | 'bot';

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
	message_id?: number;
	content: string;
	meta?: Record< string, string >;
	role: MessageRole;
	type: MessageType;
	liked?: boolean | null;
	simulateTyping?: boolean;
	context?: Context;
	rating_value?: number;
};

export type Chat = {
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

export type OdieAllowedBots = 'wpcom-support-chat' | null;
