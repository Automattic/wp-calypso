import { sitesQuery, queryClient } from '@automattic/api-queries';
import { createRoute, createLazyRoute, redirect } from '@tanstack/react-router';
import { rootRoute } from './root';
import type { AnyRoute } from '@tanstack/react-router';

export const pluginsRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'plugins',
} ).lazy( () =>
	import( '../../plugins' ).then( ( d ) =>
		createLazyRoute( 'plugins' )( {
			component: d.default,
		} )
	)
);

export const pluginsIndexRoute = createRoute( {
	getParentRoute: () => pluginsRoute,
	path: '/',
	beforeLoad: () => {
		throw redirect( { to: '/plugins/manage' } );
	},
} );

export const pluginRoute = createRoute( {
	getParentRoute: () => pluginsRoute,
	path: '$pluginId',
} ).lazy( () =>
	import( '../../plugins/plugin' ).then( ( d ) =>
		createLazyRoute( 'plugin' )( {
			component: d.default,
		} )
	)
);

export const pluginsManageRoute = createRoute( {
	getParentRoute: () => pluginsRoute,
	path: 'manage',
} ).lazy( () =>
	import( '../../plugins/manage' ).then( ( d ) =>
		createLazyRoute( 'plugins-manage' )( {
			component: d.default,
		} )
	)
);

export const pluginsScheduledUpdatesRoute = createRoute( {
	getParentRoute: () => pluginsRoute,
	path: 'scheduled-updates',
} ).lazy( () =>
	import( '../../plugins/scheduled-updates' ).then( ( d ) =>
		createLazyRoute( 'plugins-scheduled-updates' )( {
			component: d.default,
		} )
	)
);

export const pluginsScheduledUpdatesNewRoute = createRoute( {
	getParentRoute: () => pluginsRoute,
	path: 'scheduled-updates/new',
	loader: () => queryClient.ensureQueryData( sitesQuery() ),
} ).lazy( () =>
	import( '../../plugins/scheduled-updates/new' ).then( ( d ) =>
		createLazyRoute( 'plugins-scheduled-updates-new' )( {
			component: d.default,
		} )
	)
);

export const createPluginsRoutes = () => {
	const childRoutes: AnyRoute[] = [
		pluginsIndexRoute,
		pluginRoute,
		pluginsManageRoute,
		pluginsScheduledUpdatesRoute,
		pluginsScheduledUpdatesNewRoute,
	];
	return [ pluginsRoute.addChildren( childRoutes ) ];
};
