import page from '@automattic/calypso-router';
import { isSameOrigin } from '@automattic/calypso-url';
import { logmeinUrl } from 'calypso/lib/logmein';
import scrollToAnchor from 'calypso/lib/scroll-to-anchor';

// Check if the current path is within Calypso's scope.
// For example, the path "/home" is within Calypso's scope.
// The path "/setup" is not within Calypso's scope. Its part of the Stepper framework.
function isCurrentPathOutOfScope( currentPath: string ): boolean {
	const paths = [ '/setup' ];
	return paths.some( ( path ) => currentPath.startsWith( path ) );
}

// `page.current` stays '' until the page.js router starts and performs its
// first navigation. Apps that don't use page.js (e.g. the Dashboard, which
// embeds the masterbar) never start it, so calling `page.show()` there throws.
// Detect that case and fall back to a full page load.
function isRouterRunning(): boolean {
	return page.current !== '';
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
		} else if ( ! isRouterRunning() ) {
			window.location.href = path;
		} else {
			page.show( path );
		}
	} else {
		window.open( logmeinUrl( path ), openInNewTab ? '_blank' : '_self' );
	}
}
