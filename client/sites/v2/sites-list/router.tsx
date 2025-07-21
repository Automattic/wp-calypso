import {
	createLazyRoute,
	createRootRoute,
	createRoute,
	createRouter,
} from '@tanstack/react-router';
import { isAutomatticianQuery } from 'calypso/dashboard/app/queries/me-a8c';
import { rawUserPreferencesQuery } from 'calypso/dashboard/app/queries/me-preferences';
import { sitesQuery } from 'calypso/dashboard/app/queries/sites';
import { queryClient } from 'calypso/dashboard/app/query-client';
import Root from '../components/root';
import siteOverviewRouter from '../site-overview/router';
import siteSettingsRouter from '../site-settings/router';
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

const dummySiteOverviewRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'overview/$siteSlug',
	loader: async () => {
		await infiniteLoader();
	},
} );

const siteOverviewPreloadRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug',
	loader: async ( { params: { siteSlug } } ) => {
		siteOverviewRouter.preloadRoute( {
			to: `/sites/${ siteSlug }`,
		} );
		await infiniteLoader();
	},
} );

const siteSettingsPreloadRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug/settings',
	loader: async ( { params: { siteSlug } } ) => {
		siteSettingsRouter.preloadRoute( {
			to: `/sites/${ siteSlug }/settings`,
		} );
		await infiniteLoader();
	},
} );

const siteSettingsWithFeaturePreloadRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug/settings/$feature',
	loader: async ( { params: { siteSlug, feature } } ) => {
		siteSettingsRouter.preloadRoute( {
			to: `/sites/${ siteSlug }/settings/${ feature }`,
		} );
		await infiniteLoader();
	},
} );

const createRouteTree = () =>
	rootRoute.addChildren( [
		sitesRoute,
		dummySiteOverviewRoute,
		siteOverviewPreloadRoute,
		siteSettingsPreloadRoute,
		siteSettingsWithFeaturePreloadRoute,
	] );

export const { syncBrowserHistoryToRouter, syncMemoryRouterToBrowserHistory } =
	createBrowserHistoryAndMemoryRouterSync();

export const getRouter = ( { basePath }: { basePath: string } ) => {
	const routeTree = createRouteTree();
	const router = createRouter( {
		...getRouterOptions(),
		routeTree,
		basepath: basePath,
	} );

	return router;
};

export const routerConfig = {
	basePath: '/',
};

export default getRouter( routerConfig );
