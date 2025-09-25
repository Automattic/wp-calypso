export interface SocialUserConfigArgs {
	client_id: string;
	client_secret: string;
}

export interface DisconnectSocialUserArgs {
	service: string;
}

export interface ConnectSocialUserArgs {
	service: string;
	access_token?: string;
	id_token?: string;
	user_name?: string;
	user_email?: string;
	redirect_to?: string;
}

export interface PostLoginRequestBodyObj {
	service: 'github' | 'google' | 'apple';
	auth_code: string;
	client_id: string;
	client_secret: string;
}

export interface PostLoginRequestArgs {
	action: string;
	bodyObj: PostLoginRequestBodyObj;
}
