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
import * as OAuthToken from 'lib/oauth-token';
import wpcom from 'lib/wp';
import config from 'config';
import store from 'store';
import WPOAuth from 'wpcom-oauth';
import userFactory from 'lib/user';
import Main from 'components/main';
import Button from 'components/button';

module.exports = {
	login: function( context ) {
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
		const loggedOutRoutes = [ '/login', '/oauth', '/start', '/authorize' ],
			isValidSection = loggedOutRoutes.some( route => startsWith( context.path, route ) );

		if ( config( 'env' ) === 'desktop' ) {
			// Check we have an OAuth token, otherwise redirect to login page
			if ( OAuthToken.getToken() === false && ! isValidSection ) {
				page( '/login' );
			} else {
				next();
			}
		}

		let token = store.get( 'wpcom_token' );

		if ( ! token ) {
			setTimeout( function() {
				page( '/authorize' );
			}, 100 );
		} else {
			next();
		}
	},

	// Authorize
	authorize: function() {
		const oauthSettings = {
			response_type: 'token',
			client_id: config( 'oauth_client_id' ),
			client_secret: 'n/a',
			url: {
				redirect: 'http://calypso.dev:3000/api/oauth/token'
			}
		};

		const wpoauth = WPOAuth( oauthSettings );
		const authUrl = wpoauth.urlToConnect( { scope: 'global', blog_id: 0 } );

		ReactDom.render( (
			<Main>
				<Button href={ authUrl }>Authorize</Button>
			</Main>
		),
			document.getElementById( 'primary' )
		);
	},

	getToken: function( context ) {
		if ( context.hash && context.hash.access_token ) {
			store.set( 'wpcom_token', context.hash.access_token );
			wpcom.loadToken( context.hash.access_token );
		}

		if ( context.hash && context.hash.expires_in ) {
			store.set( 'wpcom_token_expires_in', context.hash.expires_in );
		}

		// Fetch user and redirect to /sites on success.
		const user = userFactory();
		console.log(user.get());
		user.fetch();
		user.on( 'change', function() {
			setTimeout( function() {
				window.location = '/sites';
			}, 100 );
		});
	}
};
