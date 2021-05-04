/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import OAuthLogin from './login';
import { getToken } from 'calypso/lib/oauth-token';
import config from '@automattic/calypso-config';
import store from 'store';

/**
 * Style dependencies
 */
import './style.scss';

export function oauthLogin( context, next ) {
	if ( ! config.isEnabled( 'oauth' ) || getToken() ) {
		page( '/' );
		return;
	}

	context.primary = <OAuthLogin />;
	next();
}

// Store token into local storage
export function storeToken( context ) {
	if ( context.hash && context.hash.access_token ) {
		store.set( 'wpcom_token', context.hash.access_token );
	}

	if ( context.hash && context.hash.expires_in ) {
		store.set( 'wpcom_token_expires_in', context.hash.expires_in );
	}

	const { next = '/' } = context.query;
	document.location.replace( next );
}
