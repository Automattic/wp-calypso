import {
	Outlet,
	Router,
	createLazyRoute,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	redirect,
} from '@tanstack/react-router';
import { siteSettingsQuery } from 'calypso/dashboard/app/queries';
import { queryClient } from 'calypso/dashboard/app/query-client';

const rootRoute = createRootRoute( { component: () => <Outlet /> } );

const dashboardSiteSettingsCompatibilityRouteRoot = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug/settings',
	loader: ( { params: { siteSlug } } ) => {
		throw redirect( { to: `/${ siteSlug }` } );
	},
} );

const dashboardSiteSettingsCompatibilityRouteWithFeature = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug/settings/$feature',
	loader: ( { params: { siteSlug, feature } } ) => {
		throw redirect( { to: `/${ siteSlug }/${ feature }` } );
	},
} );

const siteRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '$siteSlug',
	loader: ( { params: { siteSlug } } ) =>
		queryClient.ensureQueryData( siteSettingsQuery( siteSlug ) ),
	component: () => <Outlet />,
} );

const settingsRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: '/',
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings' ).then( ( d ) =>
		createLazyRoute( 'settings' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const siteVisibilityRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'site-visibility',
	loader: ( { params: { siteSlug } } ) =>
		queryClient.ensureQueryData( siteSettingsQuery( siteSlug ) ),
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-site-visibility' ).then( ( d ) =>
		createLazyRoute( 'site-visibility' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const subscriptionGiftingRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'subscription-gifting',
	loader: ( { params: { siteSlug } } ) =>
		queryClient.ensureQueryData( siteSettingsQuery( siteSlug ) ),
} ).lazy( () =>
	import( 'calypso/dashboard/sites/settings-subscription-gifting' ).then( ( d ) =>
		createLazyRoute( 'subscription-gifting' )( {
			component: () => <d.default siteSlug={ siteRoute.useParams().siteSlug } />,
		} )
	)
);

const createRouteTree = () =>
	rootRoute.addChildren( [
		siteRoute.addChildren( [ settingsRoute, siteVisibilityRoute, subscriptionGiftingRoute ] ),
		dashboardSiteSettingsCompatibilityRouteRoot,
		dashboardSiteSettingsCompatibilityRouteWithFeature,
	] );

const routeTree = createRouteTree();

const isCompatibilityRoute = ( router: Router< typeof routeTree >, url: string ) => {
	const matches = router.matchRoutes( url );
	if ( ! matches ) {
		return false;
	}

	return matches.some(
		( match: { routeId: string } ) =>
			match.routeId === dashboardSiteSettingsCompatibilityRouteRoot.id ||
			match.routeId === dashboardSiteSettingsCompatibilityRouteWithFeature.id
	);
};

const syncMemoryRouterToBrowserHistory = ( router: Router< typeof routeTree > ) => {
	let lastPath = '';

	// Sync TanStack Router's history to the browser history.
	router.history.subscribe( () => {
		const { pathname, search } = router.history.location;
		const newUrl = `${ pathname }${ search }`;

		// Avoid pushing redirect routes to the browser history.
		if ( isCompatibilityRoute( router, newUrl ) ) {
			return;
		}

		if ( window.location.pathname + window.location.search !== newUrl ) {
			window.history.pushState( null, '', newUrl );
			lastPath = newUrl;
		}
	} );

	window.addEventListener( 'popstate', () => {
		const currentPath = `${ window.location.pathname }${ window.location.search }`;
		if ( currentPath !== lastPath ) {
			router.navigate( { to: currentPath, replace: true } );
			lastPath = currentPath;
		}
	} );
};

export const getRouter = () => {
	const router = new Router( {
		routeTree,
		basepath: '/sites/settings/v2',
		defaultPreload: 'intent',
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: () => null,

		// Use memory history to compartmentize TanStack Router's history management.
		// This is necessary in order to not pollute the browser history which is used by page.js
		history: createMemoryHistory( { initialEntries: [ window.location.pathname ] } ),
	} );

	syncMemoryRouterToBrowserHistory( router );
	return router;
};

export { settingsRoute, subscriptionGiftingRoute };
