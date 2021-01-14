/**
 * External dependencies
 */
import { stringify } from 'qs';
import page from 'page';
import React from 'react';
import store from 'store';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import Connect from './connect';
import GetToken from './get-token';
import userModule from 'calypso/lib/user';
import wpcom from 'calypso/lib/wp';
import { setCurrentUser } from 'calypso/state/current-user/actions';

import { authTokenRedirectPath } from './paths';

const WP_AUTHORIZE_ENDPOINT = 'https://public-api.wordpress.com/oauth2/authorize';
const debug = debugFactory( 'calypso:jetpack-cloud-connect' );

export const connect: PageJS.Callback = ( context, next ) => {
	if ( config.isEnabled( 'oauth' ) && config( 'oauth_client_id' ) ) {
		const protocol = window.location.protocol;
		const host = window.location.hostname;
		const port = window.location.port;
		const redirectUri = port
			? `${ protocol }//${ host }:${ port }${ authTokenRedirectPath() }`
			: `${ protocol }//${ host }${ authTokenRedirectPath() }`;

		const params = {
			response_type: 'token',
			client_id: config( 'oauth_client_id' ),
			redirect_uri: redirectUri,
			scope: 'global',
			action: 'oauth2-auth',
		};

		const authUrl = `${ WP_AUTHORIZE_ENDPOINT }?${ stringify( params ) }`;
		debug( `authUrl: ${ authUrl }` );

		window.location.replace( authUrl );
	} else {
		context.primary = <p>{ 'Oauth un-enabled or client id missing!' }</p>;
	}
	next();
};

export const tokenRedirect: PageJS.Callback = ( context, next ) => {
	// We didn't get an auth token; take a step back
	// and ask for authorization from the user again
	if ( context.hash?.error ) {
		context.primary = <Connect authUrl={ authTokenRedirectPath() } />;
		return next();
	}

	if ( context.hash?.access_token ) {
		debug( 'setting user token' );
		store.set( 'wpcom_token', context.hash.access_token );

		// this does not work!
		wpcom.loadToken( context.hash.access_token );
	}

	if ( context.hash?.expires_in ) {
		debug( 'setting user token_expires_in' );
		store.set( 'wpcom_token_expires_in', context.hash.expires_in );
	}

	context.primary = <GetToken />;

	// Fetch user and redirect to / on success.
	debug( 'requesting new user' );

	const user = userModule();

	user.initialize().then( () => {
		if ( user.data ) {
			debug( 'setting current user' );
			context.store.dispatch( setCurrentUser( user.data ) );
		}
		debug( 'redirecting' );

		const SESSION_STORAGE_PATH_KEY = 'jetpack_cloud_redirect_path';
		const SESSION_STORAGE_PATH_KEY_EXPIRES_IN = 'jetpack_cloud_redirect_path_expires_in';
		const hasExpired =
			( window.sessionStorage.getItem( SESSION_STORAGE_PATH_KEY_EXPIRES_IN ) ?? 0 ) <
			new Date().getTime() / 1000;
		let redirectPath = '/';
		if ( ! hasExpired ) {
			const previousPath = window.sessionStorage.getItem( SESSION_STORAGE_PATH_KEY );
			redirectPath = previousPath ?? '/';
		}
		window.sessionStorage.removeItem( SESSION_STORAGE_PATH_KEY );
		window.sessionStorage.removeItem( SESSION_STORAGE_PATH_KEY_EXPIRES_IN );
		page.redirect( redirectPath );
	} );

	next();
};
