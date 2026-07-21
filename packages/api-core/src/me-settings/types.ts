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
	/** When false, hide this tool from account settings UIs. */
	visible?: boolean;
	/** Whether this ability is read-only. The backend guarantees this as of AIINT-469, but treat it as optional since older/partial payloads may omit it — fall back to `annotations.readonly`. */
	readonly?: boolean;
	/** The display group this ability belongs to — a clean slug (e.g. `site`), decoupled from any STRAP facade's tool key. `null`/absent for abilities with no resolved group. */
	group?: string | null;
	annotations?: McpAbilityAnnotations;
};

/** Ordered display-group descriptor for the settings UI's middle grouping layer (AIINT-469). A group's members usually come from one STRAP facade, but multiple facades can resolve to the same group (e.g. Create Site into Site), and standalone abilities can declare a group directly in config. */
export type McpGroupDescriptor = {
	name: string;
	label: string;
	description: string;
	order: number;
};

export type McpSiteOverride = {
	blog_id: number;
	account_tools_enabled?: boolean;
	site_level_enabled?: boolean;
	abilities?: Record< string, unknown >;
	/** Site-level group "enable all" intents (AIINT-471): keys are `read`, `write`, or a bare group slug (e.g. `site`). */
	group_intents?: Record< string, boolean >;
};

export type McpAbilities = {
	account?: Record< string, McpAbility >;
	site?: Record< string, McpAbility >; // Site-scoped ability defaults
	sites?: McpSiteOverride[]; // Array of site-specific overrides
	site_level_enabled_default?: boolean;
	/** Ordered display-group descriptors (AIINT-469). */
	groups?: McpGroupDescriptor[];
	/** Account-level group "enable all" intents (AIINT-471): keys are `read`, `write`, or a bare group slug (e.g. `site`). */
	group_intents?: Record< string, boolean >;
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
	/** When true, account-level AI assistant features are enabled (requires API support). */
	ai_assistant?: boolean | null;

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
