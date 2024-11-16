import { ODIE_ALLOWED_BOTS } from './constants';
import type { ReactNode, PropsWithChildren, SetStateAction } from 'react';

export type OdieAssistantContextInterface = {
	isChatLoaded: boolean;
	shouldUseHelpCenterExperience: boolean;
	addMessage: ( message: Message | Message[] ) => void;
	botName?: string;
	botNameSlug: OdieAllowedBots;
	chat: Chat;
	clearChat: () => void;
	currentUser: CurrentUser;
	isMinimized?: boolean;
	isUserEligibleForPaidSupport: boolean;
	extraContactOptions?: ReactNode;
	odieBroadcastClientId: string;
	selectedSiteId?: number | null;
	selectedSiteURL?: string | null;
	selectedConversationId?: string | null;
	waitAnswerToFirstMessageFromHumanSupport: boolean;
	setMessageLikedStatus: ( message: Message, liked: boolean ) => void;
	setChat: ( chat: Chat | SetStateAction< Chat > ) => void;
	setChatStatus: ( status: ChatStatus ) => void;
	trackEvent: ( event: string, properties?: Record< string, unknown > ) => void;
	version?: string | null;
	setWaitAnswerToFirstMessageFromHumanSupport: (
		waitAnswerToFirstMessageFromHumanSupport: boolean
	) => void;
};

export type OdieAssistantProviderProps = {
	shouldUseHelpCenterExperience?: boolean;
	botName?: string;
	botNameSlug?: OdieAllowedBots;
	isUserEligibleForPaidSupport?: boolean;
	isMinimized?: boolean;
	currentUser: CurrentUser;
	extraContactOptions?: ReactNode;
	selectedSiteId?: number | null;
	selectedSiteURL?: string | null;
	selectedConversationId?: string | null;
	version?: string | null;
	children?: ReactNode;
	setChatStatus?: ( status: ChatStatus ) => void;
} & PropsWithChildren;

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

type InquiryType =
	| 'help'
	| 'user-is-greeting'
	| 'suggestion'
	| 'refund'
	| 'billing'
	| 'unrelated-to-wordpress'
	| 'request-for-human-support';

export type OdieUserTracking = {
	path: string;
	time_spent: number;
	elements_clicked: string[];
};

export type Context = {
	nudge_id?: string | undefined;
	section_name?: string;
	session_id?: string;
	site_id: number | null;
	user_tracking?: OdieUserTracking[];
	sources?: Source[];
	question_tags?: {
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
		show_ai_avatar?: boolean;
	};
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
	| 'file'
	| 'image'
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

export type ChatStatus = 'loading' | 'loaded' | 'sending' | 'dislike' | 'transfer';

export type ReturnedChat = { chat_id: number; messages: Message[]; wpcom_user_id: number };

export type OdieChat = {
	messages: Message[];
	odieId: number | null;
	wpcomUserId: number | null;
};

export type Chat = OdieChat & {
	supportInteractionId: string | null;
	conversationId: string | null;
	clientId?: string;
	provider: SupportProvider;
	status: ChatStatus;
};

export type OdieAllowedBots = ( typeof ODIE_ALLOWED_BOTS )[ number ];

export type SupportProvider = 'zendesk' | 'odie' | 'zendesk-staging' | 'help-center';

interface ConversationParticipant {
	id: string;
	userId: string;
	unreadCount: number;
	lastRead: number;
}

export type ZendeskMessage = {
	avatarUrl?: string;
	displayName: string;
	id: string;
	received: number;
	role: string;
	source: {
		type: 'web' | 'slack';
		id: string;
		integrationId: string;
	};
	type: ZendeskContentType;
	text: string;
	mediaUrl?: string;
	altText?: string;
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

type Metadata = {
	odieChatId: number;
	createdAt: string;
	supportInteractionId: string;
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
	metadata: Metadata;
};

export type SupportInteractionUser = {
	user_id: string;
	provider: 'wpcom';
	is_owner: boolean;
};

export type SupportInteractionEvent = {
	event_external_id: string;
	event_source: SupportProvider;
	metadata?: object;
	event_order?: number;
};

export type SupportInteraction = {
	uuid: string;
	status: 'open' | 'closed';
	start_date: string;
	last_updated: string;
	users: SupportInteractionUser[];
	events: SupportInteractionEvent[];
};
