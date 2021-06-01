/**
 * External dependencies
 */
import page from 'page';

// Using page() for cross origin navigations would throw a `History.pushState` exception
// about creating state object with a cross-origin URL.
function isSameOrigin( path: string ): boolean {
	return new URL( path, window.location.href ).origin === window.location.origin;
}

export function navigate( path: string ): void {
	if ( isSameOrigin( path ) ) {
		page.show( path );
	} else {
		window.location.href = path;
	}
}
