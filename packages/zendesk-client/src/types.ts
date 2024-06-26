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
};

export type MessagingAuth = {
	user: {
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
	onError?: () => void;
	onSuccess?: () => void;
};
