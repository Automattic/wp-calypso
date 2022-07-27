/* Parameter Interfaces */

export interface AccountDetails {
	userID: number;
	username: string;
	email: string;
}

export interface SiteDetails {
	url: string;
	id: string;
	name: string;
}

export interface NewSiteParams {
	name: string;
	title: string;
}

/* Response Interfaces */

export interface BearerTokenResponse {
	success: true;
	data: {
		bearer_token: string;
		token_links: string[];
	};
}

interface SiteMetadata {
	ID: number;
	name: string;
	description: string;
	URL: string;
	site_owner: number;
}

export interface AllSitesResponse {
	sites: Array< SiteMetadata >;
}

export interface CalypsoPreferencesResponse {
	calypso_preferences: {
		recentSites: number[];
	};
}

export interface MyAccountInformationResponse {
	ID: number;
	username: string;
	email: string;
	primary_blog: number;
	primary_blog_url: string;
	language: string;
}

export interface NewUserResponse {
	code: number;
	body: {
		success: boolean;
		user_id: number;
		username: string;
		bearer_token: string;
	};
}
export interface NewSiteResponse {
	success: boolean;
	blog_details: {
		url: string;
		blogid: string;
		blogname: string;
		site_slug: string;
	};
}
export interface SiteDeletionResponse {
	ID: number;
	name: string;
	status: string;
}

export interface AccountClosureResponse {
	success: boolean;
}

export interface NewInviteResponse {
	sent: string[];
	errors: string[];
}

export interface Invite {
	invite_key: string;
	role: string;
	is_pending: boolean;
	user: {
		email: string; // Email address for the invited user.
	};
	invited_by: {
		ID: number;
		login: string;
		site_ID: number; // Target site the user is invited to.
	};
}

// Export as Array to expose function calls of arrays.
export type AllInvitesResponse = Array< Invite >;

export interface DeleteInvitesResponse {
	deleted: string[];
	invalid: string[];
}

/* Error Responses */

export interface BearerTokenErrorResponse {
	success: false;
	data: {
		errors: [
			{
				code: string;
				message: string;
			}
		];
	};
}

export interface ErrorResponse {
	error: string;
	message: string;
}
