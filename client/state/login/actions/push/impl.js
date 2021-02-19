/**
 * Internal dependencies
 */
import {
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED,
} from 'calypso/state/action-types';

import { remoteLoginUser } from 'calypso/state/login/actions/remote-login-user';

import 'calypso/state/data-layer/wpcom/login-2fa';
import 'calypso/state/login/init';

export const startPollAppPushAuth = () => ( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START } );
export const stopPollAppPushAuth = () => ( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP } );

/**
 * Creates an action that indicates that the push poll is completed
 *
 * @param {Array<string>} tokenLinks token links array
 * @returns {Function} a thunk
 */
export const receivedTwoFactorPushNotificationApproved = ( tokenLinks ) => ( dispatch ) => {
	if ( ! Array.isArray( tokenLinks ) ) {
		return dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED } );
	}

	remoteLoginUser( tokenLinks ).then( () =>
		dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED } )
	);
};
