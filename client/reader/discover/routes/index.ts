import { getCurrentTabFromURL } from 'calypso/reader/utils';
import { RECOMMENDED_TAB, SEARCH_TAB, FRESHLY_PRESSED_TAB, TAGS_TAB, LATEST_TAB } from '../helper';

type Route = { path: string; tab?: string; requiresAuth?: boolean };
export const DISCOVER_PREFIX = 'discover';

/**
 * The routes for the discover page.
 * Please pay attention which changes on this list requires restart the devlopment server
 *
 * `tab` ties a route to the tab slug `getSelectedTab` derives from the URL, so the
 * path segment and the slug can't drift apart.
 */
const ROUTES: Route[] = [
	{ path: `/${ DISCOVER_PREFIX }`, tab: RECOMMENDED_TAB },
	{ path: `/${ DISCOVER_PREFIX }/${ RECOMMENDED_TAB }`, tab: RECOMMENDED_TAB },
	{ path: `/${ DISCOVER_PREFIX }/${ SEARCH_TAB }`, tab: SEARCH_TAB },
	{ path: `/${ DISCOVER_PREFIX }/${ FRESHLY_PRESSED_TAB }`, tab: FRESHLY_PRESSED_TAB },
	{ path: `/${ DISCOVER_PREFIX }/${ TAGS_TAB }`, tab: TAGS_TAB },
	{ path: `/${ DISCOVER_PREFIX }/${ LATEST_TAB }`, tab: LATEST_TAB },
	{ path: `/${ DISCOVER_PREFIX }/reddit`, requiresAuth: true },
	{ path: `/${ DISCOVER_PREFIX }/add-new`, requiresAuth: true },
];

/**
 * The tab a discover URL selects, defaulting to Recommended for a bare `/discover`.
 */
export const getSelectedTab = ( path: string ) =>
	getCurrentTabFromURL( path, DISCOVER_PREFIX, RECOMMENDED_TAB );

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

/**
 * Search renders a different page than the other tabs, so it registers its own
 * middleware chain and is excluded from the discover stream routes.
 */
export const getSearchRoutes = ( langParam: string | undefined ) =>
	getLocalizedRoutes(
		langParam,
		ROUTES.filter( ( route ) => route.tab === SEARCH_TAB )
	);

export const getDiscoverRoutes = ( langParam: string | undefined ) =>
	getLocalizedRoutes(
		langParam,
		ROUTES.filter( ( route ) => route.tab !== SEARCH_TAB )
	);
