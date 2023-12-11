import page from '@automattic/calypso-router';
import { logmeinUrl } from 'calypso/lib/logmein';

// Using page() for cross origin navigations would throw a `History.pushState` exception
// about creating state object with a cross-origin URL.
function isSameOrigin( path: string ): boolean {
	return new URL( path, window.location.href ).origin === window.location.origin;
}

// Check if the current path is within Calypso's scope.
// For example, the path "/home" is within Calypso's scope.
// The path "/setup" is not within Calypso's scope. Its part of the Stepper framework.
function isCurrentPathOutOfScope( currentPath: string ): boolean {
	const paths = [ '/setup' ];
	return paths.some( ( path ) => currentPath.startsWith( path ) );
}

export function navigate( path: string ): void {
	if ( isSameOrigin( path ) ) {
		if ( isCurrentPathOutOfScope( window.location.pathname ) ) {
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
