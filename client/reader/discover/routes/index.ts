type Route = { path: string; requiresAuth?: boolean };
export const DISCOVER_PREFIX = 'discover';
export const DEFAULT_DISCOVER_TAB = 'recommended';

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
