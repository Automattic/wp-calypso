import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import {
	SOCIAL_CONNECT_ACCOUNT_REQUEST,
	SOCIAL_CONNECT_ACCOUNT_REQUEST_FAILURE,
	SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { getErrorFromWPCOMError } from 'calypso/state/login/utils';

import 'calypso/state/login/init';

/**
 * Connects the current WordPress.com account with a third-party social account (Google ...).
 *
 * @param {Object} socialInfo              Object containing the social service config data
 * @param {string} socialInfo.service      Social service associated with token, e.g. google.
 * @param {string} socialInfo.access_token OAuth2 Token returned from service.
 * @param {string} socialInfo.id_token     (Optional) OpenID Connect Token returned from service.
 * @param {string} socialInfo.user_name    (Optional) The user name associated with this connection, in case it's not part of id_token.
 * @param {string} socialInfo.user_email   (Optional) The user email associated with this connection, in case it's not part of id_token.
 * @param {string} redirectTo              Url to redirect the user to upon successful login
 * @returns {Function} A thunk that can be dispatched
 */
export const connectSocialUser =
	( { service, access_token, id_token, user_name, user_email }, redirectTo ) =>
	( dispatch ) => {
		dispatch( {
			type: SOCIAL_CONNECT_ACCOUNT_REQUEST,
			notice: {
				message: translate( 'Creating your account' ),
			},
		} );

		/*
		 * Before attempting the social connect, we reload the proxy.
		 * This ensures that the proxy iframe has set the correct API cookie,
		 * particularly after the user has logged in, but Calypso hasn't
		 * been reloaded yet.
		 */
		require( 'wpcom-proxy-request' ).reloadProxy();

		wpcom.req.post( { metaAPI: { accessAllUsersBlogs: true } } );

		return wpcom.req
			.post( '/me/social-login/connect', {
				service,
				access_token,
				id_token,
				user_name,
				user_email,
				redirect_to: redirectTo,

				// This API call is restricted to these OAuth keys
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
			} )
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
