import config from '@automattic/calypso-config';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import wpcom from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import 'calypso/state/jetpack-connect/init';

/**
 * Create a user account
 *
 * !! Must have same return shape as createAccount !!
 *
 * @param  {Object}  socialInfo              …
 * @param  {string}  socialInfo.service      The name of the social service
 * @param  {string}  socialInfo.access_token An OAuth2 acccess token
 * @param  {?string} socialInfo.id_token     (Optional) a JWT id_token which contains the signed user info
 * @param  {?string} flowName                Name of the flow that the user is going through
 * @returns {Promise}                         Resolves to { username, bearerToken }
 */
export function createSocialAccount( socialInfo, flowName = 'jetpack-connect' ) {
	return async ( dispatch ) => {
		dispatch( recordTracksEvent( 'calypso_jpc_social_createaccount' ) );

		try {
			const { username, bearer_token } = await wpcom.req.post( '/users/social/new', {
				...socialInfo,
				signup_flow_name: flowName,
				locale: getLocaleSlug(),
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
			} );
			dispatch( recordTracksEvent( 'calypso_jpc_social_createaccount_success' ) );
			return { username, bearerToken: bearer_token };
		} catch ( error ) {
			const err = {
				code: error.error,
				message: error.message,
				data: error.data,
			};
			dispatch(
				recordTracksEvent( 'calypso_jpc_social_createaccount_error', {
					error: JSON.stringify( err ),
					error_code: err.code,
				} )
			);
			throw err;
		}
	};
}
