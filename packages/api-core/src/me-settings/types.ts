export type McpAbilityAnnotations = {
	readonly?: boolean;
	destructive?: boolean;
	openWorldHint?: boolean;
	idempotent?: boolean;
	placeholder_images?: boolean;
	defaults?: Record< string, unknown >;
	recommended_context?: Array< {
		tool: string;
		operation: string;
		optional?: boolean;
	} >;
};

export type McpAbility = {
	name: string;
	title: string;
	description: string;
	category: string;
	category_label?: string;
	type: string;
	enabled: boolean;
	annotations?: McpAbilityAnnotations;
};

export type McpSiteOverride = {
	blog_id: number;
	account_tools_enabled?: boolean;
	abilities?: Record< string, unknown >;
};

export type McpAbilities = {
	account?: Record< string, McpAbility >;
	site?: Record< string, McpAbility >; // Site-scoped ability defaults
	sites?: McpSiteOverride[]; // Array of site-specific overrides
};

export interface UserSettings {
	advertising_targeting_opt_out: boolean;
	avatar_URL: string;
	description: string;
	first_name: string;
	last_name: string;
	display_name: string;
	is_dev_account: boolean;
	password: string;
	is_passwordless_user: boolean;
	tracks_opt_out: boolean;
	user_email: string;
	user_login: string;
	user_URL: string;
	language?: string;
	locale_variant?: string;
	i18n_empathy_mode?: boolean;
	use_fallback_for_incomplete_languages?: boolean;
	enable_translator?: boolean;
	subscription_delivery_email_blocked?: boolean;
	two_step_app_enabled: boolean;
	two_step_backup_codes_printed: boolean;
	two_step_enabled: boolean;
	two_step_enhanced_security: boolean;
	two_step_enhanced_security_forced: boolean;
	two_step_security_key_enabled: boolean;
	two_step_sms_country: string;
	two_step_sms_enabled: boolean;
	two_step_sms_phone_number: string;

	// Subscription settings
	subscription_delivery_email_default: string;
	subscription_delivery_mail_option: string;
	subscription_delivery_day: number;
	subscription_delivery_hour: number;
	subscription_delivery_jabber_default: boolean;
	p2_disable_autofollow_on_comment: boolean;

	primary_site_ID?: number;
	mcp_abilities?: McpAbilities;

	// Username change related fields
	email_verified?: boolean;
	user_login_can_be_changed?: boolean;

	// Email verification fields
	user_email_change_pending?: boolean;
	new_user_email?: string;
}

export interface PasswordValidationResponse {
	passed: boolean;
	test_results: {
		failed: {
			explanation: string;
		}[];
	};
}
