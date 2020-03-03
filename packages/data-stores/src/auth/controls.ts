/**
 * External dependencies
 */
import { createRegistryControl } from '@wordpress/data';
import { stringify } from 'qs';
import wpcomRequest, { requestAllBlogsAccess } from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import { FetchAuthOptionsAction, FetchWpLoginAction, SendLoginEmailAction } from './actions';
import { STORE_KEY } from './constants';
import { WpcomClientCredentials } from '../shared-types';

export function createControls( clientCreds: WpcomClientCredentials ) {
	requestAllBlogsAccess().catch( () => {
		throw new Error( 'Could not get all blog access.' );
	} );
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
		FETCH_WP_LOGIN: async ( { action, params }: FetchWpLoginAction ) => {
			const response = await fetch(
				// TODO Wrap this in `localizeUrl` from lib/i18n-utils
				'https://wordpress.com/wp-login.php?action=' + encodeURIComponent( action ),
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

			return {
				ok: response.ok,
				body: await response.json(),
			};
		},
		SEND_LOGIN_EMAIL: async ( { email }: SendLoginEmailAction ) => {
			return await wpcomRequest( {
				path: `/auth/send-login-email`,
				apiVersion: '1.2',
				method: 'post',
				body: {
					email,

					// TODO Send the correct locale
					lang_id: 1,
					locale: 'en',

					...clientCreds,
				},
			} );
		},
	};
}
