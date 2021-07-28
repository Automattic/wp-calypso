/**
 * global wpcomLogmein
 */
/**
 * External dependencies
 */
import { select } from '@wordpress/data';

// Used as default domain to detect when we're looking at a relative or invalid url
const INVALID_URL = 'https://__domain__.invalid';

type LogmeinData = {
	enabled: string;
};
declare let wpcomLogmeinData: LogmeinData;

export function logmeinUrl( url: string ): string {
	if ( wpcomLogmeinData?.enabled !== 'enabled' ) {
		return url;
	}

	const newurl = new URL( String( url ), INVALID_URL );

	// Ignore and passthrough invalid or /relative/urls that have no host or protocol specified
	if ( newurl.origin === INVALID_URL ) {
		return url;
	}

	// logmein doesn't work with http.
	if ( newurl.protocol !== 'https:' ) {
		return url;
	}

	// Only mapped domains need logmein, skip rewrite for wpcom subdomains
	if ( newurl.host.match( /^.*\.wordpress.com/ ) ) {
		return url;
	}

	const permalink = select( 'core/editor' ).getPermalink();
	const permaurl = new URL( String( permalink ), INVALID_URL );
	// Fallback on an invalid permalink
	if ( permaurl.origin === INVALID_URL ) {
		return url;
	}

	// Fallback if the url we're clicking on isn't pointing to our site that needs logging into
	if ( permaurl.host !== newurl.host ) {
		return url;
	}

	// Set the param
	newurl.searchParams.set( 'logmein', 'direct' );

	return newurl.toString();
}

export function attachLogmein(): void {
	document.addEventListener( 'click', logmeinOnClick, true ); // left click, ctrl+click, focus+enter, touch click, need to capture for "View Post" snackbars which call preventDefault
	document.addEventListener( 'contextmenu', logmeinOnClick, false ); // right click
	document.addEventListener( 'auxclick', logmeinOnAuxClick, false ); // mouse middle
}

export function logmeinOnClick( event: MouseEvent ): void {
	const link = ( event.target as HTMLElement ).closest( 'a' );

	if ( link && link.href ) {
		// Only apply logmein to each host once to reduce excessive redirect flows, weak persistence is intended
		link.href = logmeinUrl( link.href );
	}
}

export function logmeinOnAuxClick( event: MouseEvent ): void {
	// auxclick fires on right click but fires too late to apply the redirect to the new window/tab
	// for right click, rely on contextmenu events which fire early enough
	if ( event.button === 2 ) {
		return;
	}

	// Middle click (auxclick) events should follow the same behavior as left click
	logmeinOnClick( event );
}

attachLogmein();
