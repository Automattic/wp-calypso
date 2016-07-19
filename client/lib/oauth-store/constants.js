/**
 * External dependencies
 */
import keyMirror from 'key-mirror';

module.exports = {
	actions: keyMirror( {
		AUTH_LOGIN: null,
		RECEIVE_AUTH_LOGIN: null,
		AUTH_RESET: null
	} ),
	errors: {
		// Error codes from WP.com API
		ERROR_REQUIRES_2FA: 'needs_2fa',
		ERROR_REQUIRES_2FA_PUSH_VERIFICATION: 'needs_2fa_push_verification',
		ERROR_INVALID_OTP: 'invalid_otp',
		ERROR_INVALID_PUSH_TOKEN: 'invalid_push_token'
	}
};
