/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { logmeinUrl } from 'calypso/lib/logmein';
import userUtils from 'calypso/lib/user/utils';
import { isEnabled } from 'calypso/server/config';

// Using page() for cross origin navigations would throw a `History.pushState` exception
// about creating state object with a cross-origin URL.
function isSameOrigin( path: string ): boolean {
	return new URL( path, window.location.href ).origin === window.location.origin;
}

export function navigate( path: string ): void {
	if ( isSameOrigin( path ) ) {
		page.show( path );
	} else {
		if ( isEnabled( 'logmein' ) && userUtils.isLoggedIn() ) {
			path = logmeinUrl( path );
		}
		window.location.href = path;
	}
}
