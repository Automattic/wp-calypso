import {
	Outlet,
	Router,
	createLazyRoute,
	createRootRoute,
	createRoute,
	redirect,
} from '@tanstack/react-router';
import { siteSettingsQuery } from 'calypso/dashboard/app/queries';
import { queryClient } from 'calypso/dashboard/app/query-client';
import Root from './root';

const rootRoute = createRootRoute( { component: Root } );

const v2CompatibilityRouteRoot = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug/settings',
	loader: ( { params: { siteSlug } } ) => {
		throw redirect( { to: `/${ siteSlug }` } );
	},
} );

const v2CompatibilityRouteWithFeature = createRoute( {
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
		v2CompatibilityRouteRoot,
		v2CompatibilityRouteWithFeature,
	] );

export const getRouter = () => {
	const routeTree = createRouteTree();

	const router = new Router( {
		routeTree,
		basepath: '/sites/settings/v2',
		defaultPreload: 'intent',
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: () => null,
	} );

	return router;
};

export { settingsRoute, subscriptionGiftingRoute };
