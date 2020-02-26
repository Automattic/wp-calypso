/**
 * External dependencies
 */
import wpcomRequest, { requestAllBlogsAccess, WpcomClientCredentials } from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import { CreateAccountAction } from './types';

export default function createControls( clientCreds: WpcomClientCredentials ) {
	requestAllBlogsAccess().catch( () => {
		throw new Error( 'Could not get all blog access.' );
	} );
	return {
		CREATE_ACCOUNT: async ( action: CreateAccountAction ) => {
			const defaultParams = {
				is_passwordless: true,
				signup_flow_name: 'gutenboarding',
				client_id: clientCreds.client_id,
				client_secret: clientCreds.client_secret,
				locale: 'en',
			};
			const mergedParams = Object.assign(
				{},
				defaultParams,
				{ ...action.params },
				{ validate: false } // Set to false because account validation should be a separate action
			);
			const newUser = await wpcomRequest( {
				path: '/users/new',
				apiVersion: '1.1',
				method: 'post',
				body: mergedParams,
			} );
			return newUser;
		},
		FETCH_CURRENT_USER: async () => {
			const currentUser = await wpcomRequest( {
				path: '/me',
				apiVersion: '1.1',
			} );
			return currentUser;
		},
	};
}
