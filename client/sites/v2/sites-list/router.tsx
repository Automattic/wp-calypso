import { createLazyRoute, createRoute, createRouter } from '@tanstack/react-router';
import * as appRouter from 'calypso/dashboard/app/router';
import { rootRoute } from '../router';
import siteOverviewRouter from '../site-overview/router';
import siteSettingsRouter from '../site-settings/router';
import { getRouterOptions, createBrowserHistoryAndMemoryRouterSync } from '../utils/router';

// Keep the loading state active to prevent displaying a white screen during the redirection.
const infiniteLoader = () => new Promise( () => {} );

const sitesRoute = createRoute( {
	...appRouter.sitesRoute.options,
	getParentRoute: () => rootRoute,
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
