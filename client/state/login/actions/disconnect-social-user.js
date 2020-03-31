/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	SOCIAL_DISCONNECT_ACCOUNT_REQUEST,
	SOCIAL_DISCONNECT_ACCOUNT_REQUEST_FAILURE,
	SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS,
} from 'state/action-types';
import { getErrorFromWPCOMError } from 'state/login/utils';
import wpcom from 'lib/wp';

import 'state/login/init';

/**
 * Disconnects the current WordPress.com account from a third-party social account (Google ...).
 *
 * @param  {string}   socialService The social service name
 * @returns {Function}               A thunk that can be dispatched
 */
export const disconnectSocialUser = socialService => dispatch => {
	dispatch( {
		type: SOCIAL_DISCONNECT_ACCOUNT_REQUEST,
		notice: {
			message: translate( 'Creating your account' ),
		},
	} );

	return wpcom
		.undocumented()
		.me()
		.socialDisconnect( socialService )
		.then(
			() => {
				dispatch( {
					type: SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS,
				} );
			},
			wpcomError => {
				const error = getErrorFromWPCOMError( wpcomError );

				dispatch( {
					type: SOCIAL_DISCONNECT_ACCOUNT_REQUEST_FAILURE,
					error,
				} );

				return Promise.reject( error );
			}
		);
};
