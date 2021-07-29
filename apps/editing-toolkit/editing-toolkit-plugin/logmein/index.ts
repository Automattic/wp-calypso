// Used as default domain to detect when we're looking at a relative or invalid url
const INVALID_URL = 'https://__domain__.invalid';

type LogmeinData = {
	home_url: string;
};
declare let wpcomLogmeinData: LogmeinData;

/**
 * logmeinUrl attempts to append the ?logmein=direct parameter to the url its given.
 *
 * It will only append when the url is pointing to the home_url of this site.
 *
 * This parameter tirggers a redirect login flow for the site it points to before returning the user to the original url.
 *
 * @param url The url to append to
 * @returns string
 */
export function logmeinUrl( url: string ): string {
	const newUrl = new URL( String( url ), INVALID_URL );

	// Ignore and passthrough invalid or /relative/urls that have no host or protocol specified
	if ( newUrl.origin === INVALID_URL ) {
		return url;
	}

	const homeUrl = new URL( String( wpcomLogmeinData?.home_url ), INVALID_URL );

	// Fallback to url if we see invalid data
	if ( homeUrl.origin === INVALID_URL ) {
		return url;
	}

	// We only want to rewrite urls pointing to the home_url
	if ( homeUrl.host !== newUrl.host ) {
		return url;
	}

	// If you're already on the home_url you don't need logging in
	if ( homeUrl.host === window.location.host ) {
		return url;
	}

	// Set the param, but only if one isn't already set
	if ( newUrl.searchParams.get( 'logmein' ) === null ) {
		newUrl.searchParams.set( 'logmein', 'direct' );
	}

	return newUrl.toString();
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
	// auxclick fires on both middle and right click but the right click event
	// fires after the context menu is closed, too late to apply the change
	// So for right click, return early here, relying on contextmenu events instead
	if ( event.button === 2 ) {
		return;
	}
	logmeinOnClick( event );
}

attachLogmein();
