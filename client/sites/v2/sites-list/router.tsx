import { createLazyRoute, createRoute, createRouter } from '@tanstack/react-router';
import { APP_CONTEXT_DEFAULT_CONFIG } from 'calypso/dashboard/app/context';
import * as appRouterSites from 'calypso/dashboard/app/router/sites';
import { rootRoute } from '../router';
import siteOverviewRouter from '../site-overview/router';
import siteSettingsRouter from '../site-settings/router';
import { getRouterOptions, createBrowserHistoryAndMemoryRouterSync } from '../utils/router';
import type { AppConfig } from 'calypso/dashboard/app/context';

// Keep the loading state active to prevent displaying a white screen during the redirection.
const infiniteLoader = () => new Promise( () => {} );

const sitesRoute = createRoute( {
	...appRouterSites.sitesRoute.options,
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

export const getRouter = ( config: AppConfig ) => {
	const routeTree = createRouteTree();
	const router = createRouter( {
		...getRouterOptions( config ),
		routeTree,
	} );

	return router;
};

export const routerConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	basePath: '/',
};

export default getRouter( routerConfig );
