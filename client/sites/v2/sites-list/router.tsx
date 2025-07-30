import {
	createLazyRoute,
	createRootRoute,
	createRoute,
	createRouter,
	redirect,
} from '@tanstack/react-router';
import { isAutomatticianQuery } from 'calypso/dashboard/app/queries/me-a8c';
import { rawUserPreferencesQuery } from 'calypso/dashboard/app/queries/me-preferences';
import { sitesQuery } from 'calypso/dashboard/app/queries/sites';
import { queryClient } from 'calypso/dashboard/app/query-client';
import Root from '../components/root';
import { getRouterOptions, createBrowserHistoryAndMemoryRouterSync } from '../utils/router';

// Keep the loading state active to prevent displaying a white screen during the redirection.
const infiniteLoader = () => new Promise( () => {} );

const rootRoute = createRootRoute( { component: Root } );

const sitesRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites',
	loader: async () => {
		// Preload the default sites list response without blocking.
		queryClient.ensureQueryData( sitesQuery() );

		await Promise.all( [
			queryClient.ensureQueryData( isAutomatticianQuery() ),
			queryClient.ensureQueryData( rawUserPreferencesQuery() ),
		] );
	},
	validateSearch: ( search ) => {
		// Deserialize the view search param if it exists on the first page load.
		if ( typeof search.view === 'string' ) {
			let parsedView;
			try {
				parsedView = JSON.parse( search.view );
			} catch ( e ) {
				// pass
			}
			return { ...search, view: parsedView };
		}
		return search;
	},
} ).lazy( () =>
	import( 'calypso/dashboard/sites' ).then( ( d ) =>
		createLazyRoute( 'sites' )( {
			component: d.default,
		} )
	)
);
const dummySitesOverviewRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'overview/$siteSlug',
	loader: infiniteLoader,
	component: () => null,
} );

const sitesOverviewCompatibilityRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '/sites/$siteSlug',
	beforeLoad: ( { cause, params: { siteSlug } } ) => {
		if ( cause !== 'enter' ) {
			return;
		}
		throw redirect( { to: `/overview/${ siteSlug }`, replace: true } );
	},
} );

const createRouteTree = () =>
	rootRoute.addChildren( [ sitesRoute, dummySitesOverviewRoute, sitesOverviewCompatibilityRoute ] );

const compatibilityRoutes = [ sitesOverviewCompatibilityRoute ];

export const { syncBrowserHistoryToRouter, syncMemoryRouterToBrowserHistory } =
	createBrowserHistoryAndMemoryRouterSync( { compatibilityRoutes } );
export const getRouter = ( { basePath }: { basePath: string } ) => {
	const routeTree = createRouteTree();
	const router = createRouter( {
		...getRouterOptions(),
		routeTree,
		basepath: basePath,
	} );

	return router;
};
