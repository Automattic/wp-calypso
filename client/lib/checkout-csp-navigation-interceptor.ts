/**
 * Global navigation interceptor for checkout CSP management
 *
 * This runs on ALL pages and intercepts navigation to/from checkout
 * to ensure proper CSP headers are set/cleared via full page loads
 */

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:csp-nav-interceptor' );

/**
 * Initialize the checkout navigation interceptor
 * This should be called early in the app initialization
 */
export function initCheckoutNavigationInterceptor() {
	if ( typeof window === 'undefined' ) {
		return;
	}

	debug( 'Initializing checkout navigation interceptor' );

	// Intercept link clicks
	document.addEventListener( 'click', handleClick, true ); // Use capture phase to intercept early

	// Intercept programmatic navigation
	interceptHistoryMethods();
}

/**
 * Handle click events to intercept checkout navigation
 */
function handleClick( e: MouseEvent ) {
	const target = e.target as HTMLElement;
	const link = target.closest( 'a' );

	if ( ! link ) {
		return;
	}

	const href = link.getAttribute( 'href' );
	if ( ! href || href.startsWith( 'http' ) || href.startsWith( 'mailto:' ) || href === '#' ) {
		return;
	}

	const currentPath = window.location.pathname;
	const isCurrentlyOnCheckout =
		currentPath.includes( '/checkout' ) &&
		! currentPath.includes( '/thank-you' ) &&
		! currentPath.includes( '/failed-purchases' );

	const isNavigatingToCheckout =
		href.includes( '/checkout' ) &&
		! href.includes( '/thank-you' ) &&
		! href.includes( '/failed-purchases' );

	const isNavigatingToThankYou = href.includes( '/thank-you' );

	// Force full page load when:
	// 1. Navigating TO checkout from another page
	// 2. Navigating FROM checkout to non-checkout page (including thank-you)
	if (
		( ! isCurrentlyOnCheckout && isNavigatingToCheckout ) ||
		( isCurrentlyOnCheckout && ! isNavigatingToCheckout )
	) {
		debug( 'Intercepting navigation, forcing page load', {
			from: currentPath,
			to: href,
			isCurrentlyOnCheckout,
			isNavigatingToCheckout,
		} );

		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation(); // Stop all other handlers

		// For leaving checkout (especially to thank-you), hide content immediately
		// to prevent flash of unstyled content
		if ( isCurrentlyOnCheckout ) {
			// Add a style to hide everything during transition
			const style = document.createElement( 'style' );
			style.id = 'csp-transition-hide';
			style.textContent = 'body { opacity: 0 !important; }';
			document.head.appendChild( style );

			// Use replace for thank-you to avoid adding to history
			if ( isNavigatingToThankYou ) {
				window.location.replace( href );
			} else {
				window.location.href = href;
			}
		} else {
			// Normal navigation to checkout
			window.location.href = href;
		}

		return false; // Extra prevention
	}
}

/**
 * Intercept history API methods (pushState, replaceState)
 */
function interceptHistoryMethods() {
	const originalPushState = window.history.pushState;
	const originalReplaceState = window.history.replaceState;

	window.history.pushState = function ( ...args ) {
		const url = args[ 2 ] as string;

		if ( url && shouldForcePageLoad( window.location.pathname, url ) ) {
			debug( 'Intercepting pushState, forcing page load', { to: url } );

			// Hide content immediately if leaving checkout
			const isLeavingCheckout = window.location.pathname.includes( '/checkout' );
			if ( isLeavingCheckout ) {
				const style = document.createElement( 'style' );
				style.id = 'csp-transition-hide';
				style.textContent = 'body { opacity: 0 !important; }';
				document.head.appendChild( style );
			}

			// Use replace for thank-you pages
			if ( url.includes( '/thank-you' ) ) {
				window.location.replace( url );
			} else {
				window.location.href = url;
			}
			return;
		}

		return originalPushState.apply( window.history, args );
	};

	window.history.replaceState = function ( ...args ) {
		const url = args[ 2 ] as string;

		if ( url && shouldForcePageLoad( window.location.pathname, url ) ) {
			debug( 'Intercepting replaceState, forcing page load', { to: url } );
			window.location.href = url;
			return;
		}

		return originalReplaceState.apply( window.history, args );
	};
}

/**
 * Determine if navigation should force a page load
 */
function shouldForcePageLoad( fromPath: string, toPath: string ): boolean {
	const isCurrentlyOnCheckout =
		fromPath.includes( '/checkout' ) &&
		! fromPath.includes( '/thank-you' ) &&
		! fromPath.includes( '/failed-purchases' );

	const isNavigatingToCheckout =
		toPath.includes( '/checkout' ) &&
		! toPath.includes( '/thank-you' ) &&
		! toPath.includes( '/failed-purchases' );

	// Force reload when going to or leaving checkout
	return (
		( ! isCurrentlyOnCheckout && isNavigatingToCheckout ) ||
		( isCurrentlyOnCheckout && ! isNavigatingToCheckout )
	);
}
