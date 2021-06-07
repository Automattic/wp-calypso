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
				? site.URL
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

export function attachLogmein( isWPComLoggedIn = false ): void {
	if ( isWPComLoggedIn && isEnabled( 'logmein' ) ) {
		wpcom.req.get( '/me/sites' ).then( ( sites: any ) => {
			console.log( 'looked up sites', sites );

			const allowed: string[] = logmeinAllowedUrls( sites.sites );
			console.log( allowed );

			function getLink( target: HTMLElement ): HTMLAnchorElement | null {
				if ( target.tagName === 'A' && ( target as HTMLAnchorElement ).href ) {
					return target as HTMLAnchorElement;
				} else if ( target.parentElement ) {
					return getLink( target.parentElement as HTMLElement );
				}
				return null;
			}
			function onClick( event: Event ) {
				const link = getLink( event.target as HTMLElement );

				if ( link ) {
					let url = new URL( link.href );
					if ( allowed.indexOf( url.hostname ) !== -1 ) {
						url = appendLogmeinDirect( url );
						console.log( 'intercepted', link, 'replaced', url );
						link.href = url.toString();
					}
					return;
				}
			}
			document.addEventListener( 'click', onClick, false );
		} );
	}
}
