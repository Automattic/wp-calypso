export interface SiteUser {
	id: number;
	name: string;
	slug: string;
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
