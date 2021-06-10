/**
 * Internal Dependencies
 */
import { isEnabled } from '@automattic/calypso-config';
import getSitesItems from 'calypso/state/selectors/get-sites-items';

/**
 * Append logmein=1 query parameter to mapped domain urls we want the user to be logged in against.
 */

// Used as placeholder / default domain to detect when we're looking at a relative url
const INVALID_URL = `https://__domain__.invalid`;

export function logmeinUrl( url: string, sites: any, isWPComLoggedIn = true ): string {
	let newurl: URL;

	if ( ! isEnabled( 'logmein' ) ) {
		return url;
	}

	try {
		newurl = new URL( String( url ), INVALID_URL );
	} catch ( e ) {
		// Ignore unparseable urls
		return url;
	}

	// Ignore and passthrough /relative/urls that have no host specified
	if ( newurl.origin === INVALID_URL ) {
		return url;
	}

	let allow = logmeinAllowedUrls( sites );
	// Ignore urls not in the allow list
	allow = allow.map( ( allowed: string ) => new URL( allowed, INVALID_URL ).hostname );
	if ( allow.indexOf( newurl.hostname ) === -1 ) {
		return url;
	}

	// logmein doesn't work with http.
	newurl.protocol = 'https:';

	// we're already logged into wordpress.com so we can take a shortcut
	if ( isWPComLoggedIn ) {
		newurl.searchParams.set( 'logmein', 'direct' );
	} else {
		newurl.searchParams.set( 'logmein', '1' );
	}
	return newurl.toString();
}

export function isValidLogmeinSite( site: any ): boolean {
	return (
		! site.is_vip &&
		! site.jetpack &&
		! site.options.is_automated_transfer &&
		! site.options.is_domain_only &&
		! site.options.is_redirect &&
		! site.options.is_wpcom_atomic &&
		! site.options.is_wpcom_store &&
		! site.options.is_wpforteams_site &&
		site.options.is_mapped_domain
	);
}

export function logmeinAllowedUrls( sites: any ): string[] {
	return sites
		.map( ( site: any ) => ( isValidLogmeinSite( site ) ? new URL( site.URL ).host : false ) )
		.filter( Boolean );
}

export function appendLogmein( url: URL ): URL {
	// logmein doesn't work with http.
	url.protocol = 'https:';
	url.searchParams.set( 'logmein', '1' );
	return url;
}
export function appendLogmeinDirect( url: URL ): URL {
	// logmein doesn't work with http.
	url.protocol = 'https:';
	url.searchParams.set( 'logmein', 'direct' );
	return url;
}

let reduxStore: any = null;

export function attachLogmein( store: any ): void {
	reduxStore = store;
	document.addEventListener( 'click', logmeinOnClick, false );
}

function logmeinOnClick( event: MouseEvent ) {
	const link = ( event.target as HTMLElement ).closest( 'a' );

	const sites = Object.values( getSitesItems( reduxStore.getState() ) );
	const allowedHosts = logmeinAllowedUrls( sites );

	if ( link && link.href ) {
		let url = new URL( link.href, INVALID_URL );
		if ( allowedHosts.indexOf( url.hostname ) !== -1 ) {
			url = appendLogmeinDirect( url );
			link.href = url.toString();
		}
	}
}

export function logmeinNavigate( url: string ): void {
	if ( ! isEnabled( 'logmein' ) ) {
		window.location.href = url;
	}

	const sites = Object.values( getSitesItems( reduxStore.getState() ) );
	const allowedHosts = logmeinAllowedUrls( sites );

	let newurl = new URL( url, INVALID_URL );
	if ( allowedHosts.indexOf( newurl.hostname ) !== -1 ) {
		newurl = appendLogmeinDirect( newurl );
		window.location.href = newurl.toString();
	} else {
		window.location.href = url;
	}
}
