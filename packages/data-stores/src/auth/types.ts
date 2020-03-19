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

export interface LoginCompleteData {
	token_links: string[];
	two_step_notification_sent: undefined;
}

export interface PushNotificationSentData {
	user_id?: number;
	two_step_supported_auth_types?: string[];
	two_step_nonce?: string;
	two_step_nonce_backup?: string;
	two_step_nonce_authenticator?: string;
	two_step_nonce_push?: string;
	push_web_token?: string;
	two_step_notification_sent: 'push';
}

export interface WpLoginSuccessResponse {
	success: true;
	data: LoginCompleteData | PushNotificationSentData;
}

export interface WpLoginErrorResponse {
	success: false;
	data: {
		errors: Array< {
			code: string;
			message: string;
		} >;
		two_step_nonce?: string;
	};
}

export type WpLoginResponse = WpLoginSuccessResponse | WpLoginErrorResponse;

export interface SendLoginEmailSuccessResponse {
	success: true;
}

export interface SendLoginEmailErrorResponse {
	error: string;
	message: string;
}

export type SendLoginEmailResponse = SendLoginEmailSuccessResponse | SendLoginEmailErrorResponse;
