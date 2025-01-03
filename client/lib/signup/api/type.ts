export type AccountCreationAPIResponse =
	| {
			username: string;
			bearer_token: string;
			signup_sandbox_username?: string;
			signup_sandbox_user_id?: string;
			user_id?: string;
			email?: string;
			oauth2_redirect?: string;
			marketing_price_group?: string;
			created_account?: boolean;
	  }
	| {
			error: 'user_exists';
			message: string;
			data: {
				email: string;
			};
	  };

export type PreSignUpUserData = {
	password: string;
	email: string;
	extra: {
		first_name: string;
		last_name: string;
		username_hint: string;
	};
};

export type CreateAccountParams = {
	userData: PreSignUpUserData | null;
	flowName: string;
	lastKnownFlow: string;
	service?: string;
	access_token?: string;
	id_token?: string | null;
	isPasswordless?: boolean;
	recaptchaDidntLoad: boolean;
	recaptchaFailed: boolean;
	recaptchaToken: string;
};

export type CreateWPCOMAccountParams = Pick<
	CreateAccountParams,
	| 'userData'
	| 'flowName'
	| 'isPasswordless'
	| 'recaptchaDidntLoad'
	| 'recaptchaFailed'
	| 'recaptchaToken'
>;
export type CreateSocialAccountParams = Pick<
	CreateAccountParams,
	'service' | 'access_token' | 'id_token' | 'userData'
>;

export type AccountCreateReturn =
	| {
			error: 'user_exists';
			message: string;
			data: {
				email: string;
			};
	  }
	| {
			ID?: string;
			username?: string;
			marketing_price_group?: string | undefined;
			bearer_token?: string | undefined;
	  };

export type SocialAuthParams = {
	service?: string;
	access_token?: string;
	id_token?: string | null;
};
