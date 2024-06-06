export type AccountCreationAPIResponse = {
	username: string;
	bearer_token: string;
	signup_sandbox_username?: string;
	signup_sandbox_user_id?: string;
	user_id?: string;
	email?: string;
	oauth2_redirect?: string;
	marketing_price_group?: string;
	created_account?: boolean;
};

export type CreateAccountParams = {
	userData: {
		username: string;
		email?: string;
		user_email?: string;
		ID: string;
	};
	flowName: string;
	lastKnownFlow: string;
	queryArgs: { jetpack_redirect: string; oauth2_redirect: string; oauth2_client_id: string };
	service: string;
	access_token: string;
	id_token: string;
	oauth2Signup: string;
	recaptchaDidntLoad: string;
	recaptchaFailed: string;
	recaptchaToken: string;
};

export type CreateNewAccountParams = Pick<
	CreateAccountParams,
	| 'userData'
	| 'flowName'
	| 'queryArgs'
	| 'recaptchaDidntLoad'
	| 'recaptchaFailed'
	| 'recaptchaToken'
	| 'oauth2Signup'
>;

export type WpcomResolvedResponse = {
	errors: Array< {
		error?: 'already_taken' | 'already_active' | 'email_exists' | 'user_exists';
		message: string;
		data?: { email: string };
	} >;
	response?: any;
};

export type CreateSocialAccountParams = Pick<
	CreateAccountParams,
	'service' | 'access_token' | 'id_token' | 'userData'
>;

export type AccountCreateReturn =
	| {
			errors?: Array< any >;
	  }
	| {
			username?: string;
			marketing_price_group?: string | undefined;
			bearer_token?: string | undefined;
	  };
