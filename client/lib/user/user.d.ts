import { URL } from '../../types';

export type UserMetaData = {
	links: Record< 'self' | 'help' | 'site' | 'flags', URL >;
	data?: {
		flags: {
			active_flags: string[];
		};
	};
};

export type UserData = { ID: number } & Partial< OptionalUserData >;

export type OptionalUserData = {
	abtests: Record< string, string >;
	avatar_URL: string;
	bio: string;
	date: string;
	description: string;
	display_name: string;
	email: string;
	email_verified: boolean;
	has_unseen_notes: boolean;
	is_new_reader: boolean;
	is_valid_google_apps_country: boolean;
	localeSlug: string;
	localeVariant: string;
	logout_URL: string;
	meta: UserMetaData;
	newest_note_type: string;
	phone_account: boolean;
	primarySiteSlug: string;
	primary_blog: number;
	primary_blog_is_jetpack: boolean;
	primary_blog_url: string;
	site_count: number;
	jetpack_site_count?: number;
	atomic_site_count?: number;
	has_jetpack_partner_access?: boolean;
	jetpack_partner_types?: string[];
	social_login_connections: unknown;
	user_ip_country_code: string;
	user_URL: string;
	username: string;
	visible_site_count: number;
	jetpack_visible_site_count?: number;
	atomic_visible_site_count?: number;
	is_google_domain_owner: boolean;
	had_hosting_trial: boolean;
	is_subscription_only: boolean;
};
