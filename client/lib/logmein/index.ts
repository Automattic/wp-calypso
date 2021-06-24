/**
 * Append logmein=direct query parameter to mapped domain urls.
 *
 * This triggers a remote-login redirect flow that sets authentication cookies on the
 * mapped domain enabling the nav bar and other features.
 */
/**
 * External Dependencies
 */
import { Store } from 'redux';

/**
 * Internal Dependencies
 */
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isEnabled } from '@automattic/calypso-config';

// Used as placeholder / default domain to detect when we're looking at a relative url,
// Note: also prevents exceptions from being raised
const INVALID_URL = `https://__domain__.invalid`;

type Host = string;

let reduxStore: Store;

export function logmeinUrl( url: string ): string {
	// Disable feature if not enabled
	if ( ! isEnabled( 'logmein' ) ) {
		return url;
	}

	// reduxStore must configured
	if ( ! reduxStore ) {
		return url;
	}

	// logmein=direct only works for logged into wordpress.com users
	if ( ! isUserLoggedIn( reduxStore.getState() ) ) {
		return url;
	}

	const newurl = new URL( String( url ), INVALID_URL );

	// Ignore and passthrough invalid or /relative/urls that have no host specified
	if ( newurl.origin === INVALID_URL ) {
		return url;
	}

	const sites = Object.values( getSitesItems( reduxStore.getState() ) );
	const mappedlinksite = sites.find(
		( site ) => new URL( site.options.unmapped_url, INVALID_URL ).host === newurl.host
	);
	if ( mappedlinksite ) {
		newurl.host = new URL( mappedlinksite.URL ).host;
	}

	const allowedHosts = sites
		.map( ( site: any ) => ( isValidLogmeinSite( site ) ? new URL( site.URL ).host : false ) )
		.filter( Boolean );

	if ( allowedHosts.indexOf( newurl.host ) === -1 ) {
		return url;
	}

	// logmein doesn't work with http.
	newurl.protocol = 'https:';
	newurl.searchParams.set( 'logmein', 'direct' );

	return newurl.toString();
}

function isValidLogmeinSite( site: any ): boolean {
	return (
		! site.is_vip &&
		! site.jetpack &&
		! site.options.is_automated_transfer &&
		! site.options.is_domain_only &&
		! site.options.is_redirect &&
		! site.options.is_wpcom_store &&
		site.options.is_mapped_domain
	);
}

export function setLogmeinReduxStore( store: Store ): void {
	reduxStore = store;
}

export function attachLogmein( store: Store ): void {
	setLogmeinReduxStore( store );
	document.addEventListener( 'click', logmeinOnClick, false );
	document.addEventListener( 'contextmenu', logmeinOnRightClick, false );
}

const seen: Record< Host, boolean > = {};
export function logmeinOnClick( event: MouseEvent ): void {
	const link = ( event.target as HTMLElement ).closest( 'a' );

	if ( link && link.href ) {
		// Only apply logmein to each host once
		const host = new URL( String( link.href ), INVALID_URL ).host;
		if ( ! seen[ host ] ) {
			link.href = logmeinUrl( link.href );
			seen[ host ] = true;
		}
	}
}

export function logmeinOnRightClick( event: MouseEvent ): void {
	const link = ( event.target as HTMLElement ).closest( 'a' );

	if ( link && link.href ) {
		link.href = logmeinUrl( link.href );
	}
}
