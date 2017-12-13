/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { startsWith } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import OAuthLogin from './login';
import ConnectComponent from './connect';
import * as OAuthToken from 'lib/oauth-token';
import wpcom from 'lib/wp';
import config from 'config';
import store from 'store';
import WPOAuth from 'wpcom-oauth';
import userFactory from 'lib/user';
import Main from 'components/main';
import PulsingDot from 'components/pulsing-dot';

export default {
	oauthLogin: function( context, next ) {
		if ( config.isEnabled( 'oauth' ) ) {
			if ( OAuthToken.getToken() ) {
				page( '/' );
			} else {
				context.primary = <OAuthLogin />;
			}
		} else {
			page( '/' );
		}
		next();
	},

	checkToken: function( context, next ) {
		const loggedOutRoutes = [
				'/oauth-login',
				'/oauth',
				'/start',
				'/authorize',
				'/api/oauth/token',
			],
			isValidSection = loggedOutRoutes.some( route => startsWith( context.path, route ) );

		// Check we have an OAuth token, otherwise redirect to auth/login page
		if ( OAuthToken.getToken() === false && ! isValidSection ) {
			if ( config( 'env_id' ) === 'desktop' ) {
				return page( config( 'login_url' ) );
			}

			return page( '/authorize' );
		}

		next();
	},

	// This controller renders the API authentication screen
	// for granting the app access to the user data using oauth
	authorize: function( context, next ) {
		let authUrl;

		if ( config( 'oauth_client_id' ) ) {
			const port = process.env.PORT || config( 'port' );
			const oauthSettings = {
				response_type: 'token',
				client_id: config( 'oauth_client_id' ),
				client_secret: 'n/a',
				url: {
					redirect: `http://calypso.localhost:${ port }/api/oauth/token`,
				},
			};

			const wpoauth = WPOAuth( oauthSettings );
			authUrl = wpoauth.urlToConnect( { scope: 'global', blog_id: 0 } );
		}

		context.primary = React.createElement( ConnectComponent, {
			authUrl: authUrl,
		} );
		next();
	},

	// Retrieve token from local storage
	getToken: function( context, next ) {
		if ( context.hash && context.hash.access_token ) {
			store.set( 'wpcom_token', context.hash.access_token );
			wpcom.loadToken( context.hash.access_token );
		}

		if ( context.hash && context.hash.expires_in ) {
			store.set( 'wpcom_token_expires_in', context.hash.expires_in );
		}

		// Extract this into a component...
		context.primary = (
			<Main className="auth">
				<p className="auth__welcome">Loading user...</p>
				<PulsingDot active />
			</Main>
		);

		// Fetch user and redirect to /sites on success.
		const user = userFactory();
		user.fetching = false;
		user.fetch();
		user.on( 'change', function() {
			if ( config.isEnabled( 'devdocs' ) ) {
				window.location = '/devdocs/welcome';
			} else {
				window.location = '/';
			}
		} );
		next();
	},
};
