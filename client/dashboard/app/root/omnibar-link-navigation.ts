import type { AnyRouter } from '@tanstack/react-router';

/**
 * Decide whether an omnibar anchor click should be handled as an in-app SPA
 * navigation, and to which path.
 *
 * Returns `null` (leave the click alone) for external URLs and for paths that
 * only match the Dashboard 404 fallback route. The latter is what keeps
 * button-like omnibar anchors such as `/notifications` working: they carry a
 * fake href for an element that toggles a panel via its own click handler, so
 * intercepting them would render the 404 shell instead.
 */
export function resolveOmnibarLinkNavigation(
	router: AnyRouter,
	href: string
): { path: string } | null {
	const url = new URL( href, window.location.origin );

	if ( url.origin !== window.location.origin ) {
		return null;
	}

	const path = url.pathname + url.search + url.hash;
	const parsedLocation = router.parseLocation( undefined, {
		pathname: url.pathname,
		search: url.search,
		hash: url.hash,
		href: path,
		state: { __TSR_index: 0 },
	} );
	const { foundRoute } = router.getMatchedRoutes( parsedLocation );

	if ( ! foundRoute || foundRoute.options.staticData?.isFallbackNotFoundRoute ) {
		return null;
	}

	return { path };
}
