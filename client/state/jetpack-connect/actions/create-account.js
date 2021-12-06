import config from '@automattic/calypso-config';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import makeJsonSchemaParser from 'calypso/lib/make-json-schema-parser';
import wpcom from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import 'calypso/state/jetpack-connect/init';

/**
 * Create a user account
 *
 * !! Must have same return shape as createSocialAccount !!
 *
 * @param  {object} userData          …
 * @param  {string} userData.username Username
 * @param  {string} userData.password Password
 * @param  {string} userData.email    Email
 * @returns {Promise}                  Resolves to { username, bearerToken }
 */
export function createAccount( userData ) {
	return async ( dispatch ) => {
		dispatch( recordTracksEvent( 'calypso_jpc_create_account' ) );

		try {
			const data = await wpcom.req.post( '/users/new', {
				...userData,
				locale: getLocaleSlug(),
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
			} );
			const bearerToken = makeJsonSchemaParser(
				{
					type: 'object',
					required: [ 'bearer_token' ],
					properties: {
						bearer_token: { type: 'string' },
					},
				},
				( { bearer_token } ) => bearer_token
			)( data );

			dispatch( recordTracksEvent( 'calypso_jpc_create_account_success' ) );
			return { username: userData.username, bearerToken };
		} catch ( error ) {
			dispatch(
				recordTracksEvent( 'calypso_jpc_create_account_error', {
					error_code: error.code,
					error: JSON.stringify( error ),
				} )
			);
			throw error;
		}
	};
}
