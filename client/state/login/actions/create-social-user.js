/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	SOCIAL_CREATE_ACCOUNT_REQUEST,
	SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE,
	SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS,
} from 'state/action-types';
import { getErrorFromWPCOMError } from 'state/login/utils';
import wpcom from 'lib/wp';

import 'state/login/init';

/**
 * Creates a WordPress.com account from a third-party social account (Google ...).
 *
 * @param  {object}   socialInfo     Object containing { service, access_token, id_token }
 *           {string}   service      The external social service name
 *           {string}   access_token OAuth2 access token provided by the social service
 *           {string}   id_token     JWT ID token such as the one provided by Google OpenID Connect
 * @param  {string}   flowName       The name of the current signup flow
 * @returns {Function}                A thunk that can be dispatched
 */
export const createSocialUser = ( socialInfo, flowName ) => ( dispatch ) => {
	dispatch( {
		type: SOCIAL_CREATE_ACCOUNT_REQUEST,
		notice: {
			message: translate( 'Creating your account' ),
		},
	} );

	return wpcom
		.undocumented()
		.usersSocialNew( { ...socialInfo, signup_flow_name: flowName } )
		.then(
			( wpcomResponse ) => {
				const data = {
					username: wpcomResponse.username,
					bearerToken: wpcomResponse.bearer_token,
				};
				dispatch( { type: SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS, data } );
				return data;
			},
			( wpcomError ) => {
				const error = getErrorFromWPCOMError( wpcomError );

				dispatch( {
					type: SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE,
					error,
				} );

				return Promise.reject( error );
			}
		);
};
