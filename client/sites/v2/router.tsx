import pagejs from '@automattic/calypso-router';
import {
	Router,
	createLazyRoute,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	redirect,
	type AnyRouter,
} from '@tanstack/react-router';
import { getQueryArgs } from '@wordpress/url';
import { sitesQuery } from 'calypso/dashboard/app/queries/sites';
import { queryClient } from 'calypso/dashboard/app/query-client';
import Root from './root';

const rootRoute = createRootRoute( { component: Root } );

const sitesRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '/',
	loader: () => queryClient.ensureQueryData( sitesQuery() ),
} ).lazy( () =>
	import( 'calypso/dashboard/sites' ).then( ( d ) =>
		createLazyRoute( 'sites' )( {
			component: d.default,
		} )
	)
);

const sitesOverviewCompatibilityRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug',
	loader: ( { params: { siteSlug } } ) => {
		throw redirect( { href: `${ window.location.origin }/overview/${ siteSlug }` } );
	},
} );

const sitesSettingsCompatibilityRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug/settings',
	loader: ( { params: { siteSlug } } ) => {
		throw redirect( { href: `${ window.location.origin }/sites/settings/v2/${ siteSlug }` } );
	},
} );

const createRouteTree = () =>
	rootRoute.addChildren( [
		sitesRoute,
		sitesOverviewCompatibilityRoute,
		sitesSettingsCompatibilityRoute,
	] );

let lastPath = '';

export const syncBrowserHistoryToRouter = ( router: AnyRouter ) => {
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

export const syncMemoryRouterToBrowserHistory = ( router: AnyRouter ) => {
	// Sync TanStack Router's history to the browser history (pagejs).
	return router.history.subscribe( () => {
		const { pathname, search } = router.history.location;
		const newUrl = `${ pathname }${ search }`;

		if ( window.location.pathname + window.location.search !== newUrl ) {
			pagejs.show( newUrl );
			lastPath = newUrl;
		}
	} );
};

export const getRouter = ( { basePath }: { basePath: string } ) => {
	const routeTree = createRouteTree();
	const router = new Router( {
		routeTree,
		basepath: basePath,
		defaultPreload: 'intent',
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: () => null,
		defaultViewTransition: true,

		// Use memory history to compartmentalize TanStack Router's history management.
		// This way, we separate TanStack Router's history implementation from the browser history used by page.js.
		history: createMemoryHistory( { initialEntries: [ window.location.pathname ] } ),
	} );

	return router;
};
