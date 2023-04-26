import page from 'page';
import { logmeinUrl } from 'calypso/lib/logmein';

// Using page() for cross origin navigations would throw a `History.pushState` exception
// about creating state object with a cross-origin URL.
function isSameOrigin( path: string ): boolean {
	return new URL( path, window.location.href ).origin === window.location.origin;
}

// Check whether the section is defined as a page.js routing path or not.
// For example, the section "/setup" is registered by react-router-dom instead of page.js
function isPageRegistered() {
	return !! String( page.base() );
}

// Check if the path is within Calypso's scope.
// For example, the path "/home" is within Calypso's scope.
// The path "/setup" is not within Calypso's scope. Its part of the Stepper framework.
function isPathOutOfScope( redirectPath: string ): boolean {
	const paths = [ '/setup' ];
	return paths.some( ( path ) => redirectPath.startsWith( path ) );
}

export function navigate( path: string ): void {
	if ( isSameOrigin( path ) ) {
		if ( ! isPageRegistered() && ! isPathOutOfScope( path ) ) {
			const state = { path };
			window.history.pushState( state, '', path );
			dispatchEvent( new PopStateEvent( 'popstate', { state } ) );
		} else {
			page.show( path );
		}
	} else {
		window.location.href = logmeinUrl( path );
	}
}
