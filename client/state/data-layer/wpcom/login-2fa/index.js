/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import { TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START } from 'state/action-types';
import {
	startPollAppPushAuth,
	stopPollAppPushAuth,
	receivedTwoFactorPushNotificationApproved,
} from 'state/login/actions/push/impl'; // Import implementations directly, to avoid cyclical refs.
import { updateNonce } from 'state/login/actions/update-nonce';
import {
	getTwoFactorAuthNonce,
	getTwoFactorPushPollInProgress,
	getTwoFactorPushToken,
	getTwoFactorUserId,
} from 'state/login/selectors';
import { http } from 'state/http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { localizeUrl } from 'lib/i18n-utils';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Module constants
 */
const POLL_APP_PUSH_INTERVAL_SECONDS = 5;

const requestTwoFactorPushNotificationStatus = ( action ) => ( dispatch, getState ) => {
	const state = getState();
	const auth_type = 'push';
	const user_id = getTwoFactorUserId( state );
	const two_step_nonce = getTwoFactorAuthNonce( state, auth_type );
	const two_step_push_token = getTwoFactorPushToken( state );

	dispatch(
		http(
			{
				url: localizeUrl(
					'https://wordpress.com/wp-login.php?action=two-step-authentication-endpoint'
				),
				method: 'POST',
				headers: [ [ 'Content-Type', 'application/x-www-form-urlencoded' ] ],
				withCredentials: true,
				body: {
					user_id,
					auth_type,
					remember_me: true,
					two_step_nonce,
					two_step_push_token,
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
				},
			},
			action
		)
	);
};

const receivedTwoFactorPushNotificationApprovedResponse = ( action, response ) =>
	receivedTwoFactorPushNotificationApproved( get( response, 'body.data.token_links' ) );

/*
 * Receive error from the two factor push notification status http request
 */
const receivedTwoFactorPushNotificationError = ( action, error ) => ( dispatch, getState ) => {
	const isNetworkFailure = ! error.status;
	const twoStepNonce = get( error, 'response.body.data.two_step_nonce' );

	if ( twoStepNonce ) {
		dispatch( updateNonce( 'push', twoStepNonce ) );
	} else if ( ! isNetworkFailure ) {
		dispatch( stopPollAppPushAuth() );
		return;
	}

	setTimeout( () => {
		// If the poll wasn't stopped while we were waiting, send the status request again.
		// It directly calls the `fetch` handler with a "dummy" action object.
		if ( getTwoFactorPushPollInProgress( getState() ) ) {
			dispatch( requestTwoFactorPushNotificationStatus( startPollAppPushAuth() ) );
		}
	}, POLL_APP_PUSH_INTERVAL_SECONDS * 1000 );
};

const makePushNotificationRequest = dispatchRequest( {
	fetch: requestTwoFactorPushNotificationStatus,
	onSuccess: receivedTwoFactorPushNotificationApprovedResponse,
	onError: receivedTwoFactorPushNotificationError,
} );

registerHandlers( 'state/data-layer/wpcom/login-2fa/index.js', {
	[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START ]: [ makePushNotificationRequest ],
} );
