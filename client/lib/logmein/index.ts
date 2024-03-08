/**
 * Append logmein=direct query parameter to mapped domain urls.
 *
 * This triggers a remote-login redirect flow that sets authentication cookies on the
 * mapped domain enabling the nav bar and other features.
 */

import { isEnabled } from '@automattic/calypso-config';
import { Store } from 'redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import type { SiteDetails } from '@automattic/data-stores';

// Used as default domain to detect when we're looking at a relative or invalid url
const INVALID_URL = 'https://__domain__.invalid';

type Host = string;

let reduxStore: Store;

export function logmeinUrl( url: string, redirectTo = '' ): string {
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

	// Ignore and passthrough invalid or /relative/urls that have no host or protocol specified
	if ( newurl.origin === INVALID_URL ) {
		return url;
	}

	const sites = Object.values( getSitesItems( reduxStore.getState() ) );

	// We only want to logmein into valid sites that belong to the user (for now that is mapped simple sites)
	// using INVALID_URL here to prevent the possibility of exceptions, if site.URL ever contains an invalid url
	// the filtering will fail
	const isValid = sites.some( ( site ) => {
		return (
			new URL( site.URL ?? '', INVALID_URL ).host === newurl.host && isValidLogmeinSite( site )
		);
	} );
	if ( ! isValid ) {
		return url;
	}

	// Set the param
	newurl.searchParams.set( 'logmein', 'direct' );
	redirectTo && newurl.searchParams.set( 'redirect_to', redirectTo );

	return newurl.toString();
}

/**
 * This function attempts to figure out if a site is a mapped simple site.
 *
 * There are some redundant checks here, for example, vip and atomic sites are all
 * jetpack sites. We eventually want to support atomic sites with logmein so I'm erring
 * on being specific about the exclusions.
 * @param site Site object from redux state
 */
function isValidLogmeinSite( site: SiteDetails ): boolean {
	return Boolean(
		! site.is_vip &&
			! site.jetpack &&
			! site.options?.is_automated_transfer &&
			! site.options?.is_domain_only &&
			! site.options?.is_redirect &&
			! site.options?.is_wpcom_store &&
			site.options?.is_mapped_domain
	);
}

export function setLogmeinReduxStore( store: Store ): void {
	reduxStore = store;
}

export function attachLogmein( store: Store ): void {
	setLogmeinReduxStore( store );
	document.addEventListener( 'click', logmeinOnClick, false ); // left click, ctrl+click, focus+enter, touch click
	document.addEventListener( 'auxclick', logmeinOnAuxClick, false ); // mouse middle
	document.addEventListener( 'contextmenu', logmeinOnRightClick, false ); // right click
}

const seen: Record< Host, boolean > = {};
export function logmeinOnClick( event: MouseEvent ): void {
	const link = ( event.target as HTMLElement ).closest( 'a' );

	if ( link && link.href ) {
		// Only apply logmein to each host once to reduce excessive redirect flows, weak persistence is intended
		const host = new URL( String( link.href ), INVALID_URL ).host;
		if ( ! seen[ host ] ) {
			link.href = logmeinUrl( link.href );
			seen[ host ] = true;
		}
	}
}

export function logmeinOnRightClick( event: MouseEvent ): void {
	const link = ( event.target as HTMLElement ).closest( 'a' );

	// Always apply logmein on right click, we can't use the `seen` cache here because right clicks
	// won't always result in visiting the redirect url
	if ( link && link.href ) {
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
