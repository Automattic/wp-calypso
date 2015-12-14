/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import startsWith from 'lodash/string/startsWith';
import page from 'page';

/**
 * Internal dependencies
 */
import LoginComponent from './login';
import * as OAuthToken from 'lib/oauth-token';

module.exports = {
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
		// Check we have an OAuth token, otherwise redirect to login page
		if ( OAuthToken.getToken() === false && ! startsWith( context.path, '/login' ) && ! startsWith( context.path, '/oauth' ) ) {
			page( '/login' );
		} else {
			next();
		}
	}
};
