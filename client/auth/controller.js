/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import startsWith from 'lodash/startsWith';
import page from 'page';

/**
 * Internal dependencies
 */
import LoginComponent from './login';
import ConnectComponent from './connect';
import * as OAuthToken from 'lib/oauth-token';
import wpcom from 'lib/wp';
import config from 'config';
import store from 'store';
import WPOAuth from 'wpcom-oauth';
import userFactory from 'lib/user';
import Main from 'components/main';
import PulsingDot from 'components/pulsing-dot';

module.exports = {

	// Login screen used by the desktop application
	login: function() {
		if ( OAuthToken.getToken() ) {
			page( '/' );
		} else {
			ReactDom.render(
				React.createElement( LoginComponent, {} ),
				document.getElementById( 'primary' )
			);
		}
	},

	checkToken: function( context, next ) {
		const loggedOutRoutes = [ '/login', '/oauth', '/start', '/authorize', '/api/oauth/token' ],
			isValidSection = loggedOutRoutes.some( route => startsWith( context.path, route ) );

		// Check we have an OAuth token, otherwise redirect to auth/login page
		if ( OAuthToken.getToken() === false && ! isValidSection ) {
			if ( config( 'env_id' ) === 'desktop' ) {
				return page( '/login' );
			}

			return page( '/authorize' );
		}

		next();
	},

	// This controller renders the API authentication screen
	// for granting the app access to the user data using oauth
	authorize: function() {
		let authUrl;

		if ( config( 'oauth_client_id' ) ) {
			const oauthSettings = {
				response_type: 'token',
				client_id: config( 'oauth_client_id' ),
				client_secret: 'n/a',
				url: {
					redirect: 'http://calypso.localhost:3000/api/oauth/token'
				}
			};

			const wpoauth = WPOAuth( oauthSettings );
			authUrl = wpoauth.urlToConnect( { scope: 'global', blog_id: 0 } );
		}

		ReactDom.render(
			React.createElement( ConnectComponent, {
				authUrl: authUrl
			} ),
			document.getElementById( 'primary' )
		);
	},

	// Retrieve token from local storage
	getToken: function( context ) {
		if ( context.hash && context.hash.access_token ) {
			store.set( 'wpcom_token', context.hash.access_token );
			wpcom.loadToken( context.hash.access_token );
		}

		if ( context.hash && context.hash.expires_in ) {
			store.set( 'wpcom_token_expires_in', context.hash.expires_in );
		}

		// Extract this into a component...
		ReactDom.render( (
			<Main className="auth">
				<p className="auth__welcome">
					Loading user...
				</p>
				<PulsingDot active />
			</Main>
		), document.getElementById( 'primary' ) );

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
	}
};
