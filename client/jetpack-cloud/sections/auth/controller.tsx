/**
 * External dependencies
 */
import React from 'react';
import store from 'store';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import Connect from './connect';

const WP_AUTHORIZE_ENDPOINT = 'https://public-api.wordpress.com/oauth2/authorize';
const debug = debugFactory( 'calypso:jetpack-cloud-connect' );

export const connect: PageJS.Callback = ( context, next ) => {
	if ( config.isEnabled( 'oauth' ) && config( 'oauth_client_id' ) ) {
		const redirectUri = new URL( '/connect/oauth/token', window.location.origin );

		const authUrl = new URL( WP_AUTHORIZE_ENDPOINT );
		authUrl.search = new URLSearchParams( {
			response_type: 'token',
			client_id: config( 'oauth_client_id' ),
			redirect_uri: redirectUri.toString(),
			scope: 'global',
		} ).toString();

		debug( `authUrl: ${ authUrl }` );

		window.location.replace( authUrl.toString() );
	} else {
		context.primary = <p>{ 'Oauth un-enabled or client id missing!' }</p>;
	}
	next();
};

export const tokenRedirect: PageJS.Callback = ( context, next ) => {
	// We didn't get an auth token; take a step back
	// and ask for authorization from the user again
	if ( context.hash?.error ) {
		context.primary = <Connect authUrl="/connect/oauth/token" />;
		return next();
	}

	if ( context.hash?.access_token ) {
		debug( 'setting user token' );
		store.set( 'wpcom_token', context.hash.access_token );
	}

	if ( context.hash?.expires_in ) {
		debug( 'setting user token_expires_in' );
		store.set( 'wpcom_token_expires_in', context.hash.expires_in );
	}

	document.location.replace( context.query.next || '/' );
};
