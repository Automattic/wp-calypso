/** Keys are whatever the site has registered with `show_in_rest`; values are Unix timestamps in seconds. */
export type SiteUserMeta = Record< string, number | undefined >;

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
