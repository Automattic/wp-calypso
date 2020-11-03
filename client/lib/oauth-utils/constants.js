export const actions = {
	AUTH_LOGIN: 'AUTH_LOGIN',
	RECEIVE_AUTH_LOGIN: 'RECEIVE_AUTH_LOGIN',
	AUTH_RESET: 'AUTH_RESET',
};

export const errors = {
	ERROR_REQUIRES_2FA: 'needs_2fa', // From WP.com API
	ERROR_INVALID_OTP: 'invalid_otp', // From WP.com API
};
