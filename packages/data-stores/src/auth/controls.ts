/**
 * External dependencies
 */
import { createRegistryControl } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { wpcomRequest, WpcomClientCredentials } from '../utils';
import { wpLogin, FetchAuthOptionsAction } from './actions';
import { STORE_KEY } from './constants';

export function createControls( clientCreds: WpcomClientCredentials ) {
	return {
		SELECT_USERNAME_OR_EMAIL: createRegistryControl( registry => () => {
			return registry.select( STORE_KEY ).getUsernameOrEmail();
		} ),
		FETCH_AUTH_OPTIONS: async ( { usernameOrEmail }: FetchAuthOptionsAction ) => {
			const escaped = encodeURIComponent( usernameOrEmail );

			return await wpcomRequest( {
				path: `/users/${ escaped }/auth-options`,
				apiVersion: '1.1',
			} );
		},
		WP_LOGIN: async ( { action, params }: ReturnType< typeof wpLogin > ) => {
			return await wpcomRequest( {
				path: '/wp-login.php?action=' + action,
				method: 'post',
				body: {
					rememberme: true,
					...clientCreds,
					...params,
				},
			} );
		},
	};
}
