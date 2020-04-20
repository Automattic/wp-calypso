/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	SOCIAL_CONNECT_ACCOUNT_REQUEST,
	SOCIAL_CONNECT_ACCOUNT_REQUEST_FAILURE,
	SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS,
} from 'state/action-types';
import { getErrorFromWPCOMError } from 'state/login/utils';
import wpcom from 'lib/wp';

import 'state/login/init';

/**
 * Connects the current WordPress.com account with a third-party social account (Google ...).
 *
 * @param  {object}   socialInfo     Object containing { service, access_token, id_token, redirectTo }
 *           {string}   service      The external social service name
 *           {string}   access_token OAuth2 access token provided by the social service
 *           {string}   id_token     JWT ID token such as the one provided by Google OpenID Connect
 * @param  {string}   redirectTo     Url to redirect the user to upon successful login
 * @returns {Function}                A thunk that can be dispatched
 */
export const connectSocialUser = ( socialInfo, redirectTo ) => ( dispatch ) => {
	dispatch( {
		type: SOCIAL_CONNECT_ACCOUNT_REQUEST,
		notice: {
			message: translate( 'Creating your account' ),
		},
	} );

	return wpcom
		.undocumented()
		.me()
		.socialConnect( { ...socialInfo, redirect_to: redirectTo } )
		.then(
			( wpcomResponse ) => {
				dispatch( {
					type: SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS,
					redirect_to: wpcomResponse.redirect_to,
				} );
			},
			( wpcomError ) => {
				const error = getErrorFromWPCOMError( wpcomError );

				dispatch( {
					type: SOCIAL_CONNECT_ACCOUNT_REQUEST_FAILURE,
					error,
				} );

				return Promise.reject( error );
			}
		);
};
