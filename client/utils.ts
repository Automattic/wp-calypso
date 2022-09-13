// Adapts route paths to also include wildcard
// subroutes under the root level section.

export function pathToRegExp( path: string ) {
	// Prevents root level double dash urls from being validated.
	if ( path === '/' ) {
		return path;
	}
	return new RegExp( '^' + path + '(/.*)?$' );
}

export function debounce< T, U >( callback: ( ...args: T[] ) => U, timeout: number ) {
	let timeoutId: number | undefined = undefined;
	return ( ...args: T[] ) => {
		window.clearTimeout( timeoutId );
		timeoutId = window.setTimeout( () => {
			callback( ...args );
		}, timeout );
	};
}

export function redirectToLaunchpad( siteSlug: string, launchpadFlow: string ) {
	window.location.replace( `/setup/launchpad?flow=${ launchpadFlow }&siteSlug=${ siteSlug }` );
}
