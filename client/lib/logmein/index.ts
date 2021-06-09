/**
 * Internal Dependencies
 */
import { isEnabled } from '@automattic/calypso-config';
import wpcom from 'calypso/lib/wp';

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

export function logmeinAllowedUrls( sites: any ): string[] {
	return sites
		.map( ( site: any ) =>
			! site.is_vip &&
			! site.jetpack &&
			! site.options.is_automated_transfer &&
			! site.options.is_domain_only &&
			! site.options.is_redirect &&
			! site.options.is_wpcom_atomic &&
			! site.options.is_wpcom_store &&
			! site.options.is_wpforteams_site &&
			site.options.is_mapped_domain
				? new URL( site.URL ).host
				: false
		)
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

let allowedSites: string[] = [];

export function attachLogmein( isWPComLoggedIn = false ): void {
	if ( ! isEnabled( 'logmein' ) ) {
		return;
	}

	if ( isWPComLoggedIn ) {
		wpcom
			.me()
			.sites()
			.then( ( sites: any ) => {
				allowedSites = logmeinAllowedUrls( sites.sites );
				document.addEventListener( 'click', logmeinOnClick, false );
			} );
	}
}

function logmeinOnClick( event: MouseEvent ) {
	const link = ( event.target as HTMLElement ).closest( 'a' );

	if ( link && link.href ) {
		let url = new URL( link.href, INVALID_URL );
		if ( allowedSites.indexOf( url.hostname ) !== -1 ) {
			url = appendLogmeinDirect( url );
			console.log( 'intercepted', link.href, 'replaced', url.toString() );
			link.href = url.toString();
		}
		return;
	}
}

export function logmeinNavigate( url: string ): void {
	if ( ! isEnabled( 'logmein' ) ) {
		window.location.href = url;
	}

	let newurl = new URL( url, INVALID_URL );
	if ( allowedSites.indexOf( newurl.hostname ) !== -1 ) {
		newurl = appendLogmeinDirect( newurl );
		console.log( 'intercepted', url, 'replaced', newurl.toString() );
		window.location.href = newurl.toString();
	} else {
		window.location.href = url;
	}
}
