/**
 * External dependencies
 */
import cookie from 'cookie';

/**
 * Internal dependencies
 */
import { COOKIE_NAME, MAX_COOKIE_AGE } from './constants';

function getViewCount() {
	const cookies = cookie.parse( document.cookie );
	const value = cookies[ COOKIE_NAME ] || 0;
	return +value;
}

function setViewCount( value ) {
	document.cookie = cookie.serialize( COOKIE_NAME, value, {
		path: window.location.pathname,
		maxAge: MAX_COOKIE_AGE,
	} );
}

function incrementCookieValue() {
	const repeatVisitorBlocks = Array.from(
		document.querySelectorAll( '.wp-block-jetpack-repeat-visitor' )
	);
	if ( repeatVisitorBlocks.length === 0 ) {
		return;
	}

	setViewCount( getViewCount() + 1 );
}

window && window.addEventListener( 'load', incrementCookieValue );
