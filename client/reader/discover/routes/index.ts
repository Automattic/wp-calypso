type Route = { path: string; requiresAuth?: boolean };

/**
 * The routes for the discover page.
 * Please pay attention which changes on this list requires restart the devlopment server
 *
 */
const ROUTES: Route[] = [
	{ path: '/discover' },
	{ path: '/discover/recommended' },
	{ path: '/discover/firstposts' },
	{ path: '/discover/tags' },
	{ path: '/discover/latest' },
	{ path: '/discover/freshly-pressed' },
	{ path: '/discover/latest' },
	{ path: '/discover/reddit', requiresAuth: true },
	{ path: '/discover/add-new', requiresAuth: true },
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
