export interface UserResponse {
	ID: number;
	user_login: string;
	first_name: string;
	last_name: string;
	nice_name: string;
	display_name: string;
	description: string;
	avatar_URL: string;
	profile_URL: string;
	primary_blog: {
		ID: number;
		feed_ID: number;
		URL: string;
		title: string;
		description: string;
		avatar_URL: string | null;
	} | null;
	recommended_blogs_count?: number;
}

export type ReaderUser = Pick<
	UserResponse,
	| 'ID'
	| 'user_login'
	| 'first_name'
	| 'last_name'
	| 'nice_name'
	| 'display_name'
	| 'description'
	| 'avatar_URL'
	| 'profile_URL'
>;

/**
 * The body for `/users/new`. Each signup flow (checkout, signup, invites,
 * Jetpack Connect) sends a different subset of the optional fields.
 */
export interface NewUserRequest {
	client_id: string;
	client_secret: string;
	email?: string;
	username?: string;
	password?: string;
	is_passwordless?: boolean;
	validate?: boolean;
	locale?: string;
	signup_flow_name?: string;
	send_verification_email?: boolean;
	anon_id?: string;
	tos?: {
		path: string;
		locale: string;
		viewport: string;
	};
	extra?: {
		username_hint?: string;
	};
	new_site_params?: Record< string, unknown >;
	should_create_site?: boolean;
	'g-recaptcha-error'?: string;
	'g-recaptcha-response'?: string;
	blackbox_session_id?: string;
}

export interface NewUserResponse {
	success: boolean;
	bearer_token?: string;
	username?: string;
	blog_details?: {
		blogid?: string;
	};
}
