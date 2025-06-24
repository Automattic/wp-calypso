import {
	Router,
	createLazyRoute,
	createRootRoute,
	createRoute,
	redirect,
} from '@tanstack/react-router';
import { sitesQuery } from 'calypso/dashboard/app/queries/sites';
import { queryClient } from 'calypso/dashboard/app/query-client';
import { getRouterOptions, createBrowserHistoryAndMemoryRouterSync } from '../utils/router';
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

export const { syncBrowserHistoryToRouter, syncMemoryRouterToBrowserHistory } =
	createBrowserHistoryAndMemoryRouterSync();

export const getRouter = ( { basePath }: { basePath: string } ) => {
	const routeTree = createRouteTree();
	const router = new Router( {
		...getRouterOptions(),
		routeTree,
		basepath: basePath,
	} );

	return router;
};
