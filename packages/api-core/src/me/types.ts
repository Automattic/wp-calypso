export type UserFlags = 'calypso_allow_nonprimary_domains_without_plan';

export interface SocialLoginConnection {
	service: string;
	service_user_email: string;
	service_user_id: string;
}

export interface User {
	ID: number;
	username: string;
	display_name: string;
	avatar_URL?: string;
	language: string;
	locale_variant: string;
	email: string;
	email_verified: boolean;
	has_unseen_notes: boolean;
	site_count: number;
	meta: {
		data: {
			flags: {
				active_flags: UserFlags[];
			};
		};
	};
	social_login_connections: SocialLoginConnection[];
}

export interface TwoStep {
	two_step_reauthorization_required: boolean;
}
