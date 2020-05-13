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
import config from 'config';
import Connect from './connect';
import GetToken from './get-token';
import userModule from 'lib/user';
import wpcom from 'lib/wp';
import { setCurrentUser } from 'state/current-user/actions';

import { authTokenRedirectPath, authConnectPath } from './paths';

const WP_AUTHORIZE_ENDPOINT = 'https://public-api.wordpress.com/oauth2/authorize';
const debug = debugFactory( 'calypso:jetpack-cloud-connect' );

export const connect: PageJS.Callback = ( context, next ) => {
	if ( config.isEnabled( 'oauth' ) && config( 'oauth_client_id' ) ) {
		const protocol = config( 'protocol' );
		const host = config( 'hostname' );
		const port = config( 'port' );
		const redirectUri = `${ protocol }://${ host }:${ port }${ authTokenRedirectPath() }`;

		const params = {
			response_type: 'token',
			client_id: config( 'oauth_client_id' ),
			redirect_uri: redirectUri,
			scope: 'global',
		};

		// page.redirect( `${ WP_AUTHORIZE_ENDPOINT  }?${ stringify( params ) }` );
		context.primary = <Connect authUrl={ `${ WP_AUTHORIZE_ENDPOINT }?${ stringify( params ) }` } />;
	} else {
		context.primary = <p>{ 'Oauth un-enabled or client id missing!' }</p>;
	}
	next();
};

export const tokenRedirect: PageJS.Callback = ( context, next ) => {
	if ( context.hash && context.hash.access_token ) {
		debug( 'setting user token' );
		store.set( 'wpcom_token', context.hash.access_token );
		// this does not work!
		wpcom.loadToken( context.hash.access_token );
	}

	if ( context.hash && context.hash.expires_in ) {
		debug( 'setting user token_expires_in' );
		store.set( 'wpcom_token_expires_in', context.hash.expires_in );
	}

	// Extract this into a component...
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
		page.redirect( '/' );
	} );

	next();
};

export const logoutRedirect: PageJS.Callback = ( context ) => {
	store.remove( 'wpcom_token' );
	store.remove( 'wpcom_token_expires_in' );

	wpcom.loadToken( null );
	// this does not work like we would want
	context.store.dispatch( setCurrentUser( { ID: null } ) );
	userModule()
		.clear()
		.finally( () => {
			page.redirect( authConnectPath() );
		} );
};
