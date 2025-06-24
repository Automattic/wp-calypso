import page from '@automattic/calypso-router';
import { logmeinUrl } from 'calypso/lib/logmein';
import scrollToAnchor from 'calypso/lib/scroll-to-anchor';

// Using page() for cross origin navigations would throw a `History.pushState` exception
// about creating state object with a cross-origin URL.
export function isSameOrigin( path: string ): boolean {
	return new URL( path, window.location.href ).origin === window.location.origin;
}

// Check if the current path is within Calypso's scope.
// For example, the path "/home" is within Calypso's scope.
// The path "/setup" is not within Calypso's scope. Its part of the Stepper framework.
function isCurrentPathOutOfScope( currentPath: string ): boolean {
	const paths = [ '/setup' ];
	return paths.some( ( path ) => currentPath.startsWith( path ) );
}

function shouldNavigateWithinSamePage( path: string ): boolean {
	const currentPath = window.location.pathname;
	const targetUrl = new URL( path, window.location.origin );
	return currentPath === targetUrl.pathname && !! targetUrl.hash;
}

function getScrollableContainer( node: HTMLElement ): HTMLElement | undefined {
	if ( node === document.body ) {
		return undefined;
	}

	const overflowY = window.getComputedStyle( node ).overflowY;
	const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';
	if ( isScrollable && node.scrollHeight >= node.clientHeight ) {
		return node;
	}

	if ( node.parentNode ) {
		return getScrollableContainer( node.parentNode as HTMLElement );
	}

	return undefined;
}

export function navigate( path: string, openInNewTab = false, forceReload = false ): void {
	if ( isSameOrigin( path ) ) {
		if ( openInNewTab ) {
			window.open( path, '_blank' );
		} else if ( forceReload ) {
			window.location.href = path;
		} else if ( isCurrentPathOutOfScope( window.location.pathname ) ) {
			const state = { path };
			window.history.pushState( state, '', path );
			dispatchEvent( new PopStateEvent( 'popstate', { state } ) );
		} else if ( shouldNavigateWithinSamePage( path ) ) {
			const targetUrl = new URL( path, window.location.origin );
			const element = document.querySelector( targetUrl.hash );
			if ( element ) {
				window.location.hash = targetUrl.hash;
				scrollToAnchor( {
					offset: 72,
					container: getScrollableContainer( element as HTMLElement ),
				} );
			}
		} else {
			page.show( path );
		}
	} else {
		window.open( logmeinUrl( path ), openInNewTab ? '_blank' : '_self' );
	}
}
