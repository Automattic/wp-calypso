export type UserFlags = 'calypso_allow_nonprimary_domains_without_plan' | 'wpcom-flex';

export interface SocialLoginConnection {
	service: string;
	service_user_email: string;
	service_user_id: string;
}

export interface UserMetaData {
	links: Partial< Record< 'self' | 'help' | 'site' | 'flags', string > >;
	data: {
		flags?: {
			active_flags: string[];
		};
	};
}

export interface User {
	ID: number;
	abtests: Record< string, string >;
	atomic_site_count: number;
	atomic_visible_site_count: number;
	avatar_URL?: string;
	date: string;
	display_name: string;
	email: string;
	email_verified: boolean;
	garden_site_count: number;
	had_hosting_trial: boolean;
	has_jetpack_partner_access?: boolean;
	has_unseen_notes: boolean;
	i18n_empathy_mode: boolean;
	is_google_domain_owner?: boolean;
	is_subscription_only: boolean;
	is_valid_google_apps_country: boolean;
	jetpack_partner_types?: string[];
	jetpack_site_count?: number;
	jetpack_visible_site_count?: number;
	language: string;
	lasagna_jwt: string;
	locale_variant: string;
	logout_URL: string;
	meta: UserMetaData;
	newest_note_type: string;
	phone_account: boolean;
	primary_blog: number;
	primary_blog_is_jetpack: boolean;
	primary_blog_url: string;
	profile_URL: string;
	site_count: number;
	social_login_connections: SocialLoginConnection[];
	use_fallback_for_incomplete_languages: boolean;
	user_ip_country_code: string;
	username: string;
	verified: boolean;
	visible_site_count: number;

	/**
	 * The bootstraped user's primary site slug.
	 * @deprecated Use `primary_blog_url` instead.
	 */
	primarySiteSlug?: string;

	/**
	 * The bootstraped user's locale slug, e.g. `es`.
	 * @deprecated Use `language` instead.
	 */
	localeSlug?: string;

	/**
	 * The bootstrapped user's locale variant, e.g. `es-mx`.
	 * @deprecated Use `locale_variant` instead.
	 */
	localeVariant?: string;

	/**
	 * The subkey for Subscription Management.
	 */
	subscriptionManagementSubkey?: string;

	/**
	 * Whether the user was bootstrapped (injected server-side).
	 */
	bootstrapped?: boolean;
}

export interface TwoStep {
	two_step_reauthorization_required: boolean;
}
