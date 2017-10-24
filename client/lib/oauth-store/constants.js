/**
 * External dependencies
 *
 * @format
 */

import keyMirror from 'key-mirror';

export const actions = keyMirror( {
	AUTH_LOGIN: null,
	RECEIVE_AUTH_LOGIN: null,
	AUTH_RESET: null,
} );

export const errors = {
	ERROR_REQUIRES_2FA: 'needs_2fa', // From WP.com API
	ERROR_INVALID_OTP: 'invalid_otp', // From WP.com API
};

export default { actions, errors };
