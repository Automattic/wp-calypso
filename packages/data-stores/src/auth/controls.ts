/**
 * External dependencies
 */
import { createRegistryControl } from '@wordpress/data';
import { stringify } from 'qs';
import wpcomRequest, { reloadProxy, requestAllBlogsAccess } from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import {
	FetchAuthOptionsAction,
	FetchWpLoginAction,
	RemoteLoginUserAction,
	SendLoginEmailAction,
} from './actions';
import { STORE_KEY } from './constants';
import { WpcomClientCredentials } from '../shared-types';

/**
 * Creates a promise that will be rejected after a given timeout
 *
 * @param ms amount of milliseconds till reject the promise
 * @returns a promise that will be rejected after ms milliseconds
 */
const createTimingOutPromise = ( ms: number ) =>
	new Promise( ( _, reject ) => {
		setTimeout( () => reject( new Error( `timeout of ${ ms } reached` ) ), ms );
	} );

/**
 * Makes a request to a given link in an iframe
 *
 * @param loginLink the login link to load
 * @param requestTimeout amount of time to allow the link to load, default 25s
 * @returns a promise that will be resolved if the link was successfully loaded
 */
const makeRemoteLoginRequest = ( loginLink: string, requestTimeout = 25000 ) => {
	if ( typeof document === 'undefined' ) {
		return Promise.reject();
	}

	let iframe: HTMLIFrameElement | undefined;
	const iframeLoadPromise = new Promise( resolve => {
		iframe = document.createElement( 'iframe' );
		iframe.style.display = 'none';
		iframe.setAttribute( 'scrolling', 'no' );
		iframe.onload = resolve;
		iframe.src = loginLink;
		document.body.appendChild( iframe );
	} );

	const removeIframe = () => {
		iframe?.parentElement?.removeChild( iframe );
	};

	return Promise.race( [ iframeLoadPromise, createTimingOutPromise( requestTimeout ) ] ).then(
		removeIframe,
		removeIframe
	);
};

export interface ControlsConfig extends WpcomClientCredentials {
	/**
	 * True if user needs immediate access to cookies after logging in.
	 * See README.md for details.
	 * Default: true
	 */
	loadCookiesAfterLogin?: boolean;
}

export function createControls( config: ControlsConfig ) {
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
			const { client_id, client_secret, loadCookiesAfterLogin = true } = config;

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
						client_id,
						client_secret,
						...params,
					} ),
				}
			);

			if ( loadCookiesAfterLogin && response.ok ) {
				reloadProxy();
			}

			return {
				ok: response.ok,
				body: await response.json(),
			};
		},
		SEND_LOGIN_EMAIL: async ( { email }: SendLoginEmailAction ) => {
			const { client_id, client_secret } = config;

			return await wpcomRequest( {
				path: `/auth/send-login-email`,
				apiVersion: '1.2',
				method: 'post',
				body: {
					email,

					// TODO Send the correct locale
					lang_id: 1,
					locale: 'en',

					client_id,
					client_secret,
				},
			} );
		},
		REMOTE_LOGIN_USER: ( { loginLinks }: RemoteLoginUserAction ) =>
			Promise.all(
				loginLinks
					.map( loginLink => makeRemoteLoginRequest( loginLink ) )
					// make sure we continue even when a remote login fails
					.map( promise => promise.catch( () => undefined ) )
			),
	};
}
