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
import wpcom from 'calypso/lib/wp';
import config from '@automattic/calypso-config';
import store from 'store';
import userFactory from 'calypso/lib/user';
import Main from 'calypso/components/main';
import PulsingDot from 'calypso/components/pulsing-dot';

/**
 * Style dependencies
 */
import './style.scss';

const WP_AUTHORIZE_ENDPOINT = 'https://public-api.wordpress.com/oauth2/authorize';

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
			const protocol = process.env.PROTOCOL || config( 'protocol' );
			const host = process.env.HOST || config( 'hostname' );
			const port = process.env.PORT || config( 'port' );
			const redirectUri = `${ protocol }://${ host }:${ port }/api/oauth/token`;

			const params = new URLSearchParams( {
				response_type: 'token',
				client_id: config( 'oauth_client_id' ),
				redirect_uri: redirectUri,
				scope: 'global',
				blog_id: 0,
			} );

			authUrl = `${ WP_AUTHORIZE_ENDPOINT }?${ params.toString() }`;
		}

		context.primary = <ConnectComponent authUrl={ authUrl } />;
		next();
	},

	// Retrieve token from local storage
	getToken: function ( context, next ) {
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

		// Fetch user and redirect to / on success.
		const user = userFactory();
		user.fetching = false;
		user.fetch();
		user.on( 'change', function () {
			if ( config.isEnabled( 'devdocs' ) ) {
				window.location = '/devdocs/welcome';
			} else {
				window.location = '/';
			}
		} );
		next();
	},
};
