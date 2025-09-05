export interface UserSettings {
	user_login?: string;
	user_email?: string;
	user_URL?: string;
	primary_site_ID?: number;
	locale_variant?: string;
	language?: string;
	i18n_empathy_mode?: boolean;
	use_fallback_for_incomplete_languages?: boolean;
	enable_translator?: boolean;
	calypso_preferences?: Record< string, unknown >;
	display_name?: string;
	first_name?: string;
	last_name?: string;
	description?: string;
	is_dev_account?: boolean;
	advertising_targeting_opt_out?: boolean;
	tracks_opt_out?: boolean;
}
