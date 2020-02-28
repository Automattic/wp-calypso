/**
 * External dependencies
 */
import { createRegistryControl } from '@wordpress/data';
import { stringify } from 'qs';

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
			const response = await fetch(
				// TODO Wrap this in `localizeUrl` from lib/i18n-utils
				'https://wordpress.com/wp-login.php?action=' + action,
				{
					method: 'POST',
					credentials: 'include',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: stringify( {
						remember_me: true,
						...clientCreds,
						...params,
					} ),
				}
			);

			return await response.json();
		},
	};
}
