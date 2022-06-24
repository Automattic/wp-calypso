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
	code: number;
	body: {
		success: boolean;
		blog_details: {
			url: string;
			blogid: string;
			blogname: string;
			site_slug: string;
		};
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
