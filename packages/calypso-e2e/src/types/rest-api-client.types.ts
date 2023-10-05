/* Parameter Interfaces */

export type SitePostState = 'publish' | 'draft' | 'trash' | 'future';

export interface AccountDetails {
	userID: number;
	username: string;
	email: string;
}

/**
 * @deprecated This interface should not be used. Instead, use `NewSiteResponse`.
 */
export interface SiteDetails {
	url: string;
	id: number;
	name: string;
}

export interface NewSiteParams {
	name: string;
	title: string;
}

export interface NewPostParams {
	date?: Date;
	title: string;
	content?: string;
}
export interface SettingsParams {
	[ key: string ]: string | number;
}

export interface NewCommentParams {
	content: string;
}

/* Response Interfaces */

export interface BearerTokenResponse {
	success: true;
	data: {
		bearer_token: string;
		token_links: string[];
	};
}

export interface DomainData {
	blog_id: number;
	domain: string;
}

export interface AllDomainsResponse {
	domains: Array< DomainData >;
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
		blogid: number;
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

interface Widget {
	id: string;
	sidebar: string;
	position: number;
}

export type AllWidgetsResponse = Array< Widget >;

export interface DeleteInvitesResponse {
	deleted: string[];
	invalid: string[];
}

export interface PostResponse {
	ID: number;
	URL: string;
	title: string;
	status: 'trash' | 'publish' | 'private' | 'draft' | 'future' | 'deleted';
}

export interface NewMediaResponse {
	URL: string;
	title: string;
	file: string;
}

export interface ReaderMetadata {
	ID: number;
	site_ID: number;
	author: {
		ID: number;
		login: string;
	};
}

export interface ReaderResponse {
	posts: Array< ReaderMetadata >;
}

export interface NewCommentResponse {
	ID: number;
	raw_content: string;
}

export interface CommentLikeResponse {
	success: boolean;
	i_like: boolean;
	like_count: number;
}

export interface PluginResponse {
	id: string;
	slug: string;
	active: boolean;
	name: string;
}
export interface AllPluginsResponse {
	plugins: Array< PluginResponse >;
}

export interface PluginParams {
	active: boolean;
	[ key: string ]: string | number | boolean;
}
export interface PluginRemovalResponse {
	log: string[];
}

export interface JetpackSearchParams {
	query: string;
	size?: number;
	// Lots more of course -- add as needed!
}

export interface JetpackSearchResponse {
	results: unknown[];
	// Lots more of course -- add as needed!
}

export interface PublicizeConnection {
	ID: number;
	site_ID: number;
	label: string;
	external_ID: string;
}

export interface PublicizeConnectionDeletedResponse {
	ID: number;
	deleted: boolean;
}

export interface Subscriber {
	user_id: number;
	subscription_id: number;
	email_address: string;
	display_name: string;
	date_subscribed: string;
}

export interface SubscriberDeletedResponse {
	follower_id: string;
	deleted: true;
}

export interface PostCountsResponse {
	counts: {
		all: {
			publish: number;
			future: number;
			draft: number;
			trash: number;
		};
		mine: {
			draft: number;
			publish: number;
			trash: number;
		};
	};
}

/* Error Responses */

export interface BearerTokenErrorResponse {
	success: false;
	data: {
		errors: [
			{
				code: string;
				message: string;
			},
		];
	};
}

export interface ErrorResponse {
	error: string;
	message: string;
}
