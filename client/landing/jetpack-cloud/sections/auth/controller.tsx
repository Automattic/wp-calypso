/**
 * External dependencies
 */
import { stringify } from 'qs';
import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import Connect from './connect';
import GetToken from './get-token';
import store from 'store';
import userFactory from 'lib/user';
import wpcom from 'lib/wp';

import { authTokenRedirectPath } from './paths';

const WP_AUTHORIZE_ENDPOINT = 'https://public-api.wordpress.com/oauth2/authorize';

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
			blog_id: 0,
		};

		context.primary = <Connect authUrl={ `${ WP_AUTHORIZE_ENDPOINT }?${ stringify( params ) }` } />;
	}
	next();
};

export const tokenRedirect: PageJS.Callback = ( context, next ) => {
	if ( context.hash && context.hash.access_token ) {
		store.set( 'wpcom_token', context.hash.access_token );
		wpcom.loadToken( context.hash.access_token );
	}

	if ( context.hash && context.hash.expires_in ) {
		store.set( 'wpcom_token_expires_in', context.hash.expires_in );
	}

	// Extract this into a component...
	context.primary = <GetToken />;

	// Fetch user and redirect to / on success.
	const user = userFactory();
	user.fetching = false;
	user.fetch();
	user.on( 'change', function() {
		window.location = '/';
	} );
	next();
};
