/** @format */
/**
 * External dependencies
 */
import cookie from 'cookie';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { COOKIE_NAME, MAX_COOKIE_AGE } from './constants';

// TODO: Remove debug capability
const debug = debugFactory( 'wp-gutenberg:visited-block' );

function getViewCount() {
	const cookies = cookie.parse( document.cookie );
	const value = cookies[ COOKIE_NAME ] || 0;
	debug( 'cookie value', +value );
	return +value;
}

function setViewCount( value ) {
	debug( 'new cookie value', value );
	document.cookie = cookie.serialize( COOKIE_NAME, value, {
		path: window.location.pathname,
		maxAge: MAX_COOKIE_AGE,
	} );
}

function incrementCookieValue() {
	const visitedBlocks = Array.from( document.querySelectorAll( '.wp-block-jetpack-visited' ) );
	if ( visitedBlocks.length === 0 ) {
		return;
	}

	setViewCount( getViewCount() + 1 );
}

window && window.addEventListener( 'load', incrementCookieValue );
