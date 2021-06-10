/**
 * Internal Dependencies
 */
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import userUtils from 'calypso/lib/user/utils';
import { isEnabled } from '@automattic/calypso-config';

/**
 * Append logmein=direct query parameter to mapped domain urls.
 *
 * This triggers a remote-login redirect flow that sets authentication cookies on the
 * mapped domain enabling the nav bar and other features.
 */

let reduxStore: any = null;

// Used as placeholder / default domain to detect when we're looking at a relative url
const INVALID_URL = `https://__domain__.invalid`;

export function logmeinUrl( url: string ): string {
	let newurl: URL;

	// Disable feature if not enabled
	if ( ! isEnabled( 'logmein' ) ) {
		return url;
	}

	// logmein=direct only works for logged into wordpress.com users
	if ( ! userUtils.isLoggedIn() ) {
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

	const sites = Object.values( getSitesItems( reduxStore.getState() ) );
	const allowedHosts = logmeinAllowedUrls( sites );
	if ( allowedHosts.indexOf( newurl.host ) === -1 ) {
		return url;
	}

	// logmein doesn't work with http.
	newurl.protocol = 'https:';
	newurl.searchParams.set( 'logmein', 'direct' );

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

export function attachLogmein( store: any ): void {
	reduxStore = store;
	document.addEventListener( 'click', logmeinOnClick, false );
}

function logmeinOnClick( event: MouseEvent ) {
	const link = ( event.target as HTMLElement ).closest( 'a' );

	if ( link && link.href ) {
		link.href = logmeinUrl( link.href );
	}
}
