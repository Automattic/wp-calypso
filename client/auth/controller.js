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
import { setSection } from 'state/ui/actions';
import LoginComponent from './login';
import * as OAuthToken from 'lib/oauth-token';

module.exports = {
	login: function( context ) {
		if ( OAuthToken.getToken() ) {
			page( '/' );
		} else {
			context.store.dispatch( setSection( 'login', { hasSidebar: false } ) );

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
