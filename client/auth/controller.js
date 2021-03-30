/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import OAuthLogin from './login';
import ConnectComponent from './connect';
import { getToken } from 'calypso/lib/oauth-token';
import config from '@automattic/calypso-config';
import store from 'store';

/**
 * Style dependencies
 */
import './style.scss';

export default {
	oauthLogin: function ( context, next ) {
		if ( ! config.isEnabled( 'oauth' ) || getToken() ) {
			page( '/' );
			return;
		}

		context.primary = <OAuthLogin />;
		next();
	},

	// This controller renders the API authentication screen
	// for granting the app access to the user data using oauth
	authorize: function ( context, next ) {
		let authUrl;

		if ( config( 'oauth_client_id' ) ) {
			const redirectUri = `${ window.location.origin }/api/oauth/token`;

			const params = new URLSearchParams( {
				response_type: 'token',
				client_id: config( 'oauth_client_id' ),
				redirect_uri: redirectUri,
				scope: 'global',
				blog_id: 0,
			} );

			authUrl = `https://public-api.wordpress.com/oauth2/authorize?${ params.toString() }`;
		}

		context.primary = <ConnectComponent authUrl={ authUrl } />;
		next();
	},

	// Store token into local storage
	getToken: function ( context ) {
		if ( context.hash && context.hash.access_token ) {
			store.set( 'wpcom_token', context.hash.access_token );
		}

		if ( context.hash && context.hash.expires_in ) {
			store.set( 'wpcom_token_expires_in', context.hash.expires_in );
		}

		document.location.replace( '/' );
	},
};
