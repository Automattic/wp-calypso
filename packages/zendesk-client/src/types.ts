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
	messaging_ai_chat_id?: string;
	messaging_initial_message?: string;
	messaging_plan?: string;
	messaging_source?: string;
	messaging_url?: string;
	/**
	 * Site ID of the site the user is currently on.
	 */
	messaging_site_id: string | number | null;
};

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

export type UseSmoochProps = {
	init: boolean;
	destroy: () => void;
	initSmooch: ( ref: HTMLDivElement ) => void;
	createConversation?: (
		userfields: UserFields,
		metadata: Conversation[ 'metadata' ]
	) => Promise< void >;
	getConversation?: ( chatId?: number ) => Promise< Conversation | undefined >;
	sendMessage?: ( message: string, chatId?: number | null ) => void;
	addMessengerListener?: ( callback: ( message: Message ) => void ) => void;
	addUnreadCountListener?: ( callback: ( unreadCount: number ) => void ) => void;
};
