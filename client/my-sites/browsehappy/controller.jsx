/**
 * External Dependencies
 */
import React from 'react';
import debugFactory from 'debug';
import { parse as parseUrl } from 'url';
import { startsWith } from 'lodash';

/**
 * Internal Dependencies
 */
import BrowseHappy from './main';

const debug = debugFactory( 'calypso:browsehappy' );

export function renderBrowseHappy( context, next ) {
	context.primary = <BrowseHappy />;
	context.secondary = null;
	next();
}

export function redirectToSignup( context, next ) {
	const { url } = context.query;
	if ( isWordPressSection( 'start', url ) ) {
		debug( 'redirecting to signup', context );
		redirect( context, 'https://wordpress.com/wp-signup.php?browsehappy' );
		return;
	}
	next();
}

export function redirectToInvite( context, next ) {
	const { url } = context.query;
	if ( isWordPressSection( 'accept-invite', url ) ) {
		debug( 'should redirect to invitation flow' );
	}
	next();
}

function isWordPressSection( topLevel, url ) {
	return url && startsWith( pathname( url ), `/${ topLevel }` );
}

function pathname( url ) {
	const { pathname: result } = parseUrl( url, false, false );
	return result;
}

function redirect( context, url ) {
	if ( context.redirect ) {
		context.redirect( url );
		return;
	}

	if ( typeof window !== 'undefined' ) {
		window.location = url;
	}
}
