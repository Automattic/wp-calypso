import { ODIE_ALLOWED_BOTS } from './constants';
import type { CheckoutSupportVariation } from '@automattic/data-stores';
import type {
	SmoochIntegrationKey,
	ZendeskConversation,
	ZendeskTicketFields,
} from '@automattic/zendesk-client';
import type { ComponentType, ReactNode, PropsWithChildren, SetStateAction } from 'react';

export type OdieAssistantContextInterface = {
	isChatLoaded: boolean;
	canConnectToZendesk: boolean;
	isLoadingCanConnectToZendesk: boolean;
	addMessage: ( message: Message | Message[] ) => void;
	botName?: string;
	newInteractionsBotSlug: string;
	newLoggedOutInteractionsBotSlug: string;
	newInteractionsBotVersion?: string;
	chat: Chat;
	clearChat: () => void;
	currentUser: CurrentUser;
	experimentVariationName: string | undefined | null;
	hasUserEverEscalatedToHumanSupport: boolean;
	isLoadingZendeskHistory: boolean;
	isMinimized?: boolean;
	isUserEligibleForPaidSupport: boolean;
	// An open human chat can be reopened even without paid support.
	hasOpenZendeskChat: boolean;
	selectedSiteId?: number | null;
	selectedSiteURL?: string | null;
	userFieldMessage?: string | null;
	userFieldFlowName?: string | null;
	zendeskConversationTags?: string[];
	zendeskIntegrationKey?: SmoochIntegrationKey | null;
	humanSupportRouting?: HumanSupportRouting | null;
	// A request for a human that the routing step hasn't decided on yet.
	pendingHumanSupportRequest: HumanSupportRequest | null;
	setPendingHumanSupportRequest: ( request: HumanSupportRequest | null ) => void;
	externalChatProvider?: string | null;
	externalChatId?: string | null;
	forceEmailSupport: boolean;
	isChatRestricted: boolean;
	launcherContext?: string;
	// Set while the Help Center is open from checkout as part of the checkout support experiment.
	checkoutSupportVariation?: CheckoutSupportVariation;
	setExperimentVariationName: ( variationName: string | null | undefined ) => void;
	setChat: ( chat: Chat | SetStateAction< Chat > ) => void;
	setChatStatus: ( status: ChatStatus ) => void;
	trackEvent: ( event: string, properties?: Record< string, unknown > ) => void;
	version?: string | null;
};

export type OdieAssistantProviderProps = {
	newInteractionsBotSlug: OdieAllowedBots;
	newLoggedOutInteractionsBotSlug: string;
	newInteractionsBotVersion?: string;
	canConnectToZendesk?: boolean;
	isLoadingCanConnectToZendesk?: boolean;
	botName?: string;
	isUserEligibleForPaidSupport?: boolean;
	hasOpenZendeskChat?: boolean;
	isMinimized?: boolean;
	currentUser: CurrentUser;
	selectedSiteId?: number | null;
	selectedSiteURL?: string | null;
	userFieldMessage?: string | null;
	userFieldFlowName?: string | null;
	zendeskConversationTags?: string[];
	zendeskIntegrationKey?: SmoochIntegrationKey | null;
	humanSupportRouting?: HumanSupportRouting | null;
	externalChatProvider?: string | null;
	externalChatId?: string | null;
	version?: string | null;
	forceEmailSupport?: boolean;
	isChatRestricted?: boolean;
	launcherContext?: string;
	children?: ReactNode;
	setChatStatus?: ( status: ChatStatus ) => void;
} & PropsWithChildren;

export type CurrentUser = {
	display_name: string;
	avatar_URL?: string;
	email?: string;
	ID?: number;
};

export type Source = {
	title: string;
	url: string;
	heading: string;
	blog_id: number;
	post_id: number;
	content: string;
	railcar?: {
		fetch_algo: string;
		fetch_lang: string;
		fetch_position: number;
		fetch_query: number;
		railcar: string;
		rec_blog_id: string;
		rec_post_id: string;
		rec_url: string;
		ui_position: number;
		ui_algo: string;
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

export type InteractionStatus = 'open' | 'closed' | 'solved';

type ClassificationResults = {
	inquiry_type?: InquiryType;
};

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
	classification_results?: ClassificationResults;
	question_tags?: ClassificationResults;
	flags?: {
		failed_zendesk_connection?: boolean;
		forward_to_human_support?: boolean;
		hide_disclaimer_content?: boolean;
		show_ai_avatar?: boolean;
		is_error_message?: boolean;
		// Sent with `forward_to_human_support` by the Woo bot.
		is_emergency?: boolean;
		emergency_type?: string | null;
		route_to_email?: boolean;
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
	| 'conversation-feedback'
	| 'help-link'
	| 'file'
	| 'file-placeholder'
	| 'image'
	| 'image-placeholder'
	| 'introduction'
	| 'form'
	| 'formResponse';

export type ChatFeedbackActions = {
	score: string;
	account_id: number;
	ticket_id: number;
};

export type Message = {
	content: ReactNode;
	context?: Context;
	displayName?: string;
	/**
	 * Set on messages originating from Zendesk, where it holds the Smooch message id.
	 */
	id?: string;
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
	feedbackOptions?: MessageAction[];
	metadata?: Record< string, any >;
	ts?: number;
	payload?: string;
	/**
	 * Timestamp of the message.
	 */
	received?: number;
};

export type ChatStatus = 'loading' | 'loaded' | 'sending' | 'dislike' | 'transfer' | 'closed';

export type ReturnedChat = {
	chat_id: number;
	session_id: string;
	messages: Message[];
	wpcom_user_id: number;
	experiment_name: string | undefined | null;
};

export type OdieChat = {
	messages: Message[];
	odieId?: number | null;
	wpcomUserId?: number | null;
};

export type Chat = OdieChat & {
	conversationId: string | null;
	clientId?: string;
	provider: SupportProvider;
	status: ChatStatus;
};

export type OdieAllowedBots = ( typeof ODIE_ALLOWED_BOTS )[ number ];

export type SupportProvider = 'zendesk' | 'odie' | 'zendesk-staging' | 'help-center';

export type MessageAction = {
	id: string;
	payload: boolean;
	text: string;
	type: string;
	metadata: ChatFeedbackActions;
	label: string;
	onClick: () => void;
	uri?: string;
};

export type OdieMessage = {
	received: number;
	role: string;
	text: string;
	altText?: string;
};

type Metadata = {
	odieChatId: number;
	createdAt: number;
	supportInteractionId: string;
	status: InteractionStatus;
	botSlug?: string;
};

export type OdieConversation = {
	id: string;
	createdAt: number;
	messages: OdieMessage[];
	metadata?: Metadata;
};

export type LoggedOutOdieConversation = OdieConversation & {
	metadata: {
		sessionId: string;
	} & Metadata;
};

export type SupportInteractionDraft = {
	bot_slug: OdieAllowedBots;
	event_external_id: string;
	event_source: SupportProvider;
};

export type Conversations = Array<
	OdieConversation | LoggedOutOdieConversation | ZendeskConversation
>;

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
	bot_slug: OdieAllowedBots;
	uuid: string;
	status: InteractionStatus;
	start_date: string;
	last_updated: string;
	users: SupportInteractionUser[];
	events: SupportInteractionEvent[];
	environment: 'staging' | 'production';
};

/** The bot's flags that come with a request for a human. */
export type HumanSupportFlags = {
	isEmergency: boolean;
	emergencyType: string | null;
	routeToEmail: boolean;
};

export type HumanSupportRequest = {
	createdFrom: string;
	flags: HumanSupportFlags;
	isFromError?: boolean;
	errorReason?: string;
	escalationOnSecondAttempt?: boolean;
};

/**
 * What the host knows about one request for a human, sent when its Zendesk conversation is
 * created so routing can use it from the start.
 */
export type HumanSupportChatValues = {
	/** The site the request is about, as the Site URL. Defaults to the selected site or the page. */
	siteUrl?: string | null;
	/** Zendesk ticket fields by field ID. */
	ticketFields?: ZendeskTicketFields;
	/** Tags added to the product's conversation tags. */
	tags?: string[];
};

export type HumanSupportRoutingStepProps = {
	request: HumanSupportRequest;
	/** Starts the Zendesk chat for the request, with what the step learned about it. */
	startChat: ( values?: HumanSupportChatValues ) => void;
	/** Drops the request, for example after sending the user somewhere else. */
	dismiss: () => void;
};

/**
 * Lets the host decide where a request for a human goes. When set, requests show `Step` in
 * the chat instead of starting a Zendesk chat right away.
 */
export type HumanSupportRouting = {
	Step: ComponentType< HumanSupportRoutingStepProps >;
};
