import { removeLocaleFromPathLocaleInFront } from '@automattic/i18n-utils';

type Route = { path: string; requiresAuth?: boolean };
const DISCOVER_PREFIX = 'discover';
const DEFAULT_TAB = 'recommended';

/**
 * The routes for the discover page.
 * Please pay attention which changes on this list requires restart the devlopment server
 *
 */
const ROUTES: Route[] = [
	{ path: `/${ DISCOVER_PREFIX }` },
	{ path: `/${ DISCOVER_PREFIX }/recommended` },
	{ path: `/${ DISCOVER_PREFIX }/firstposts` },
	{ path: `/${ DISCOVER_PREFIX }/tags` },
	{ path: `/${ DISCOVER_PREFIX }/latest` },
	{ path: `/${ DISCOVER_PREFIX }/reddit`, requiresAuth: true },
	{ path: `/${ DISCOVER_PREFIX }/add-new`, requiresAuth: true },
] as const;

export const getRouteWithPrefix = ( langParam: string | undefined, route: Route ) => {
	if ( ! langParam ) {
		return route.path;
	}

	return [ `/${ langParam }${ route.path }`, route.path ];
};

export const getLocalizedRoutes = ( langParam: string | undefined, routes: Route[] = ROUTES ) =>
	routes.flatMap( ( route ) => {
		if ( langParam ) {
			return getRouteWithPrefix( langParam, route );
		}
		return;
	} );

export const getPrivateRoutes = ( anyLangParam: string, routes: Route[] = ROUTES ) => {
	const isAuthRequired = ( route: Route ) => route.requiresAuth;
	const privateRoutes = routes.filter( isAuthRequired );

	return getLocalizedRoutes( anyLangParam, privateRoutes );
};

export const getDiscoverRoutes = ( langParam: string | undefined ) => {
	return getLocalizedRoutes( langParam, ROUTES );
};

export const getCurrentTab = ( fullPath: string, defaultTab: string = DEFAULT_TAB ) => {
	const pathWithoutQuery = fullPath.split( '?' )[ 0 ];
	const cleanedPath = removeLocaleFromPathLocaleInFront( pathWithoutQuery );
	const path = cleanedPath
		.split( `/${ DISCOVER_PREFIX }` )
		.filter( ( path ) => path !== '' )
		?.at( 0 );

	if ( ! path ) {
		return defaultTab;
	}

	return path.replace( /^\//, '' );
};
