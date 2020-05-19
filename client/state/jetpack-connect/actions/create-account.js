/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import wpcom from 'lib/wp';
import { recordTracksEvent } from 'state/analytics/actions';

import 'state/jetpack-connect/init';

/**
 * Create a user account
 *
 * !! Must have same return shape as createSocialAccount !!
 *
 * @param  {object} userData          …
 * @param  {string} userData.username Username
 * @param  {string} userData.password Password
 * @param  {string} userData.email    Email
 *
 * @returns {Promise}                  Resolves to { username, bearerToken }
 */
export function createAccount( userData ) {
	return async ( dispatch ) => {
		dispatch( recordTracksEvent( 'calypso_jpc_create_account' ) );

		try {
			const data = await wpcom.undocumented().usersNew( userData );
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
