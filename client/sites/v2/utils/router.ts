import pagejs from '@automattic/calypso-router';
import { createMemoryHistory } from '@tanstack/react-router';
import { getQueryArgs } from '@wordpress/url';
import type { AnyRouter } from '@tanstack/react-router';

export function getRouterOptions() {
	return {
		defaultPreload: 'intent' as const,
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: () => null,
		defaultViewTransition: true,

		// Use memory history to compartmentalize TanStack Router's history management.
		// This way, we separate TanStack Router's history implementation from the browser history used by page.js.
		history: createMemoryHistory( { initialEntries: [ window.location.pathname ] } ),
	};
}

export function createBrowserHistoryAndMemoryRouterSync( {
	isCompatibilityRoute,
}: {
	isCompatibilityRoute?: ( router: AnyRouter, url: string ) => boolean;
} = {} ) {
	let lastPath = '';

	const syncBrowserHistoryToRouter = ( router: AnyRouter ) => {
		const currentPath = `${ window.location.pathname }${ window.location.search }`;
		const basepath = router.options.basepath;

		// Avoid handling routes outside of the basepath.
		if ( basepath && ! currentPath.startsWith( basepath ) ) {
			return;
		}

		if ( currentPath !== lastPath ) {
			router.navigate( {
				to: window.location.pathname,
				search: getQueryArgs( window.location.search ),
				replace: true,
			} );
			lastPath = currentPath;
		}
	};

	const syncMemoryRouterToBrowserHistory = ( router: AnyRouter ) => {
		// Sync TanStack Router's history to the browser history (pagejs).
		return router.history.subscribe( () => {
			const { pathname, search } = router.history.location;
			const newUrl = `${ pathname }${ search }`;

			// Avoid pushing redirect routes to the browser history.
			if ( isCompatibilityRoute && isCompatibilityRoute( router, newUrl ) ) {
				return;
			}

			if ( window.location.pathname + window.location.search !== newUrl ) {
				pagejs.show( newUrl );
				lastPath = newUrl;
			}
		} );
	};

	return {
		syncBrowserHistoryToRouter,
		syncMemoryRouterToBrowserHistory,
	};
}
