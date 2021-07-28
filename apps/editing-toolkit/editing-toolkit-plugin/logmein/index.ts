// Used as default domain to detect when we're looking at a relative or invalid url
const INVALID_URL = 'https://__domain__.invalid';

type LogmeinData = {
	enabled: string;
	home_url: string;
};
declare let wpcomLogmeinData: LogmeinData;

export function logmeinUrl( url: string ): string {
	if ( wpcomLogmeinData?.enabled !== 'enabled' ) {
		return url;
	}

	const newUrl = new URL( String( url ), INVALID_URL );

	// Ignore and passthrough invalid or /relative/urls that have no host or protocol specified
	if ( newUrl.origin === INVALID_URL ) {
		return url;
	}

	// Only mapped domains need logmein, skip rewrite for wpcom subdomains
	if ( newUrl.host.match( /^.*\.wordpress.com/ ) ) {
		return url;
	}

	const homeUrl = new URL( String( wpcomLogmeinData?.home_url ), INVALID_URL );

	// Fallback to url if we see invalid data
	if ( homeUrl.origin === INVALID_URL ) {
		return url;
	}

	// Fallback if the url we're clicking on isn't pointing to our site that needs logging into
	if ( homeUrl.host !== newUrl.host ) {
		return url;
	}

	// Set the param
	newUrl.searchParams.set( 'logmein', 'direct' );

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
