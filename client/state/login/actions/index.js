/**
 * External dependencies
 */
import { defer } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	LOGIN_AUTH_ACCOUNT_TYPE_REQUEST,
	LOGIN_AUTH_ACCOUNT_TYPE_REQUESTING,
	LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE,
	LOGIN_AUTH_ACCOUNT_TYPE_RESET,
	LOGIN_FORM_UPDATE,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED,
} from 'state/action-types';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import 'state/data-layer/wpcom/login-2fa';
import 'state/data-layer/wpcom/users/auth-options';

import { remoteLoginUser } from 'state/login/actions/remote-login-user';

import 'state/login/init';

export { loginUser } from 'state/login/actions/login-user';
export { updateNonce } from 'state/login/actions/update-nonce';
export { loginUserWithSecurityKey } from 'state/login/actions/login-user-with-security-key';
export { loginUserWithTwoFactorVerificationCode } from 'state/login/actions/login-user-with-two-factor-verification-code';
export { loginSocialUser } from 'state/login/actions/login-social-user';
export { createSocialUser } from 'state/login/actions/create-social-user';
export { connectSocialUser } from 'state/login/actions/connect-social-user';
export { disconnectSocialUser } from 'state/login/actions/disconnect-social-user';
export { createSocialUserFailed } from 'state/login/actions/create-social-user-failed';
export { sendSmsCode } from 'state/login/actions/send-sms-code';

export const startPollAppPushAuth = () => ( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START } );
export const stopPollAppPushAuth = () => ( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP } );
export const formUpdate = () => ( { type: LOGIN_FORM_UPDATE } );

/**
 * Retrieves the type of authentication of the account (regular, passwordless ...) of the specified user.
 *
 * @param  {string}   usernameOrEmail Identifier of the user
 * @returns {Function}                 A thunk that can be dispatched
 */
export const getAuthAccountType = usernameOrEmail => dispatch => {
	dispatch( recordTracksEvent( 'calypso_login_block_login_form_get_auth_type' ) );

	dispatch( {
		type: LOGIN_AUTH_ACCOUNT_TYPE_REQUEST,
		usernameOrEmail,
	} );

	if ( usernameOrEmail === '' ) {
		const error = {
			code: 'empty_username',
			message: translate( 'Please enter a username or email address.' ),
			field: 'usernameOrEmail',
		};

		dispatch(
			recordTracksEvent( 'calypso_login_block_login_form_get_auth_type_failure', {
				error_code: error.code,
				error_message: error.message,
			} )
		);

		defer( () => {
			dispatch( {
				type: LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE,
				error,
			} );
		} );

		return;
	}

	dispatch( {
		type: LOGIN_AUTH_ACCOUNT_TYPE_REQUESTING,
		usernameOrEmail,
	} );
};

/**
 * Resets the type of authentication of the account of the current user.
 *
 * @returns {object} An action that can be dispatched
 */
export const resetAuthAccountType = () => ( {
	type: LOGIN_AUTH_ACCOUNT_TYPE_RESET,
} );

/**
 * Creates an action that indicates that the push poll is completed
 *
 * @param {Array<string>} tokenLinks token links array
 * @returns {Function} a thunk
 */
export const receivedTwoFactorPushNotificationApproved = tokenLinks => dispatch => {
	if ( ! Array.isArray( tokenLinks ) ) {
		return dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED } );
	}

	remoteLoginUser( tokenLinks ).then( () =>
		dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED } )
	);
};
