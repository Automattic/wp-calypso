// Adapts route paths to also include wildcard
// subroutes under the root level section.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pathToRegExp( path: any ) {
	// Prevents root level double dash urls from being validated.
	if ( path === '/' ) {
		return path;
	}
	return new RegExp( '^' + path + '(/.*)?$' );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce( callback: ( ...args: any[] ) => any, timeout: number ) {
	let timeoutId: number | undefined = undefined;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return ( ...args: any[] ) => {
		window.clearTimeout( timeoutId );
		timeoutId = window.setTimeout( () => {
			callback( ...args );
		}, timeout );
	};
}

export function redirectToLaunchpad( siteSlug: string, launchpadFlow: string ) {
	window.location.replace( `/setup/launchpad?flow=${ launchpadFlow }&siteSlug=${ siteSlug }` );
}
