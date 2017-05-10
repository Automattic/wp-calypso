/**
 * Internal dependencies
 */
import config from 'config';
import {
	TWO_FACTOR_AUTHENTICATION_PUSH_UPDATE_NONCE,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START,
} from 'state/action-types';
import {
	getTwoFactorUserId,
	getTwoFactorAuthNonce,
	getTwoFactorPushToken,
	getTwoFactorRememberMe,
	getTwoFactorPushPollInProgress
} from 'state/login/selectors';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { rawHttp } from 'state/data-layer/http/actions';

/***
 * Module constants
 */
const POLL_APP_PUSH_INTERVAL_SECONDS = 5;

const requestTwoFactorPushNotificationStatus = ( store, action ) => {
	store.dispatch( rawHttp( {
		url: 'https://wordpress.com/wp-login.php?action=two-step-authentication-endpoint',
		method: 'POST',
		headers: [
			{ key: 'Content-Type', value: 'application/x-www-form-urlencoded' },
		],
		withCredentials: true,
		body: {
			user_id: getTwoFactorUserId( store.getState() ),
			two_step_nonce: getTwoFactorAuthNonce( store.getState() ),
			remember_me: getTwoFactorRememberMe( store.getState() ),
			two_step_push_token: getTwoFactorPushToken( store.getState() ),
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		}
	}, action ) );
};

const receivedTwoFactorPushNotificationApproved = ( { dispatch } ) =>
	dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED } );

const receivedTwoFactorPushNotificationError = ( store, action, next, error ) => {
	store.dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_UPDATE_NONCE, twoStepNonce: error.response.body.data.two_step_nonce } );

	if ( getTwoFactorPushPollInProgress( store.getState() ) ) {
	}
	setTimeout(
		// eslint-disable-next-line no-use-before-define
		() => makePushNotificationRequest( store, { type: action.type }, next ),
		POLL_APP_PUSH_INTERVAL_SECONDS * 1000
	);
};

const makePushNotificationRequest = dispatchRequest(
	requestTwoFactorPushNotificationStatus,
	receivedTwoFactorPushNotificationApproved,
	receivedTwoFactorPushNotificationError
);

const startPolling = ( store, action, next ) => {
	next( action ); // allow the reducer change status of polling to inProgress
	return makePushNotificationRequest( store, action, next );
};

export default {
	[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START ]: [ startPolling ],
};
