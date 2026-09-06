import type { PLAN_EXPIRY_NOTICE_DISMISS_META_KEY } from './constants';

/**
 * User meta exposed on `wp/v2` `users/me`. Only the keys Calypso reads are
 * listed. Values are Unix timestamps in seconds, written by the server
 * regardless of what the client sends.
 */
export type SiteUserMeta = {
	[ key in typeof PLAN_EXPIRY_NOTICE_DISMISS_META_KEY ]?: number;
};

export interface SiteUser {
	id: number;
	name: string;
	slug: string;
	meta?: SiteUserMeta;
}

export interface WpcomSiteUser {
	ID: number;
	linked_user_ID?: number;
	login: string;
	email: string;
	name: string;
	first_name: string;
	last_name: string;
	nice_name: string;
	URL: string;
	avatar_URL: string;
	profile_URL: string;
	site_ID: number;
	roles: string[];
	is_super_admin: boolean;
}

export interface WpcomSiteUsersResponse {
	found: number;
	users: WpcomSiteUser[];
}
