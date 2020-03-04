export type LoginFlowState =
	| 'ENTER_USERNAME_OR_EMAIL'
	| 'ENTER_PASSWORD'
	| 'ENTER_2FA_CODE'
	| 'LOGIN_LINK_SENT'
	| 'WAITING_FOR_2FA_APP'
	| 'LOGGED_IN';

export interface AuthOptionsSuccessResponse {
	passwordless: boolean;
	email_verified: boolean;
}

export interface AuthOptionsErrorResponse {
	error: string;
	message: string;
}

export type AuthOptionsResponse = AuthOptionsSuccessResponse | AuthOptionsErrorResponse;

export interface WpLoginSuccessResponse {
	success: true;
	data: {
		token_links: string[];
	};
}

export interface WpLoginErrorResponse {
	success: false;
	data: {
		errors: Array< {
			code: string;
			message: string;
		} >;
	};
}

export type WpLoginResponse = WpLoginSuccessResponse | WpLoginErrorResponse;
