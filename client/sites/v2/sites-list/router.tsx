import {
	createLazyRoute,
	createRootRoute,
	createRoute,
	createRouter,
	redirect,
} from '@tanstack/react-router';
import { isAutomatticianQuery } from 'calypso/dashboard/app/queries/a8c';
import { sitesQuery } from 'calypso/dashboard/app/queries/sites';
import { queryClient } from 'calypso/dashboard/app/query-client';
import Root from '../components/root';
import { getRouterOptions, createBrowserHistoryAndMemoryRouterSync } from '../utils/router';

const rootRoute = createRootRoute( { component: Root } );

const sitesRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites',
	loader: async () => {
		// Preload the default sites list response without blocking.
		queryClient.ensureQueryData( sitesQuery() );

		await queryClient.ensureQueryData( isAutomatticianQuery() );
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

const dummySitesSettingsRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/settings/v2/$siteSlug',
	component: () => null,
} );

const sitesSettingsCompatibilityRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '/sites/$siteSlug/settings',
	beforeLoad: ( { cause, params: { siteSlug } } ) => {
		if ( cause !== 'enter' ) {
			return;
		}
		throw redirect( { to: `/sites/settings/v2/${ siteSlug }` } );
	},
} );

const createRouteTree = () =>
	rootRoute.addChildren( [
		sitesRoute,
		dummySitesOverviewRoute,
		sitesOverviewCompatibilityRoute,
		dummySitesSettingsRoute,
		sitesSettingsCompatibilityRoute,
	] );

const compatibilityRoutes = [ sitesOverviewCompatibilityRoute, sitesSettingsCompatibilityRoute ];

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
