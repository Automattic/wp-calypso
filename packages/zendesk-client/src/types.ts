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
	messaging_ai_chat_id?: string | number | null;
	messaging_initial_message?: string | null;
	messaging_plan?: string | null;
	messaging_source?: string | null;
	messaging_url?: string | null;
	/**
	 * Site ID of the site the user is currently on.
	 */
	messaging_site_id: string | number | null;
};

export type ZendeskAuthType = 'zendesk' | 'messenger';

export interface MessagingAuth {
	user: {
		external_id: string;
		jwt: string | null;
	};
}

export interface MessagingAvailability {
	is_available: boolean;
}

export type MessagingGroup = 'jp_presales' | 'wpcom_messaging' | 'wpcom_presales';

export type MessagingMetadata = {
	aiChatId?: number | string;
	message?: string;
	siteUrl?: string;
	siteId?: string | number | null;
	onError?: () => void;
	onSuccess?: () => void;
};
