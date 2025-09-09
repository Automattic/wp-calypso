export interface UserSettings {
	advertising_targeting_opt_out: boolean;
	avatar_URL: string;
	description: string;
	first_name: string;
	last_name: string;
	display_name: string;
	is_dev_account: boolean;
	password: string;
	tracks_opt_out: boolean;
	user_email: string;
	user_login: string;
	user_URL: string;
	language?: string;
	locale_variant?: string;
	i18n_empathy_mode?: boolean;
	use_fallback_for_incomplete_languages?: boolean;
	enable_translator?: boolean;
}
