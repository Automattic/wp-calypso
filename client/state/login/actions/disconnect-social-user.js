import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import {
	SOCIAL_DISCONNECT_ACCOUNT_REQUEST,
	SOCIAL_DISCONNECT_ACCOUNT_REQUEST_FAILURE,
	SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { getErrorFromWPCOMError } from 'calypso/state/login/utils';

import 'calypso/state/login/init';

/**
 * Disconnects the current WordPress.com account from a third-party social account (Google ...).
 * @param  {string}   socialService The social service name
 * @returns {Function}               A thunk that can be dispatched
 */
export const disconnectSocialUser = ( socialService ) => ( dispatch ) => {
	dispatch( {
		type: SOCIAL_DISCONNECT_ACCOUNT_REQUEST,
		notice: {
			message: translate( 'Creating your account' ),
		},
	} );

	return wpcom.req
		.post( '/me/social-login/disconnect', {
			service: socialService,

			// This API call is restricted to these OAuth keys
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		} )
		.then(
			() => {
				dispatch( {
					type: SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS,
				} );
			},
			( wpcomError ) => {
				const error = getErrorFromWPCOMError( wpcomError );

				dispatch( {
					type: SOCIAL_DISCONNECT_ACCOUNT_REQUEST_FAILURE,
					error,
				} );

				return Promise.reject( error );
			}
		);
};
