import {
	pluginsQuery,
	queryClient,
	rawUserPreferencesQuery,
	marketplacePluginsQuery,
} from '@automattic/api-queries';
import { createRoute, createLazyRoute, redirect } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { rootRoute } from './root';
import type { AnyRoute } from '@tanstack/react-router';

export const pluginsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Plugins' ),
			},
		],
	} ),
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
	head: () => ( {
		meta: [
			{
				title: __( 'Plugins' ),
			},
		],
	} ),
	getParentRoute: () => pluginsRoute,
	path: '/',
	beforeLoad: () => {
		throw redirect( { to: '/plugins/manage' } );
	},
} );

export const pluginsManageRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Manage plugins' ),
			},
		],
	} ),
	getParentRoute: () => pluginsRoute,
	path: 'manage',
	loader: async () => {
		queryClient.prefetchQuery( marketplacePluginsQuery() );
		queryClient.prefetchQuery( pluginsQuery() );
		await queryClient.ensureQueryData( rawUserPreferencesQuery() );
	},
} );

export const pluginsManageIndexRoute = createRoute( {
	getParentRoute: () => pluginsManageRoute,
	path: '/',
} ).lazy( () =>
	import( '../../plugins/manage' ).then( ( d ) =>
		createLazyRoute( 'plugins-manage' )( {
			component: d.default,
		} )
	)
);

export const pluginRoute = createRoute( {
	getParentRoute: () => pluginsManageIndexRoute,
	path: '$pluginId',
	loader: async () => {
		queryClient.prefetchQuery( marketplacePluginsQuery() );
		queryClient.prefetchQuery( pluginsQuery() );
	},
} );

export const pluginsScheduledUpdatesRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Scheduled updates' ),
			},
		],
	} ),
	getParentRoute: () => pluginsRoute,
	path: 'scheduled-updates',
} );

export const pluginsScheduledUpdatesIndexRoute = createRoute( {
	getParentRoute: () => pluginsScheduledUpdatesRoute,
	path: '/',
} ).lazy( () =>
	import( '../../plugins/scheduled-updates' ).then( ( d ) =>
		createLazyRoute( 'plugins-scheduled-updates' )( {
			component: d.default,
		} )
	)
);

export const pluginsScheduledUpdatesNewRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'New schedule' ),
			},
		],
	} ),
	getParentRoute: () => pluginsScheduledUpdatesRoute,
	path: '/new',
	loader: async ( { context } ) => {
		queryClient.prefetchQuery( context.config.queries.sitesQuery() );
	},
} ).lazy( () =>
	import( '../../plugins/scheduled-updates/new' ).then( ( d ) =>
		createLazyRoute( 'plugins-scheduled-updates-new' )( {
			component: d.default,
		} )
	)
);

export const pluginsScheduledUpdatesEditRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Edit schedule' ),
			},
		],
	} ),
	getParentRoute: () => pluginsScheduledUpdatesRoute,
	path: '/edit/$scheduleId',
	loader: async ( { context } ) => {
		queryClient.prefetchQuery( context.config.queries.sitesQuery() );
	},
} ).lazy( () =>
	import( '../../plugins/scheduled-updates/edit' ).then( ( d ) =>
		createLazyRoute( 'plugins-scheduled-updates-edit' )( {
			component: d.default,
		} )
	)
);

export const createPluginsRoutes = () => {
	const childRoutes: AnyRoute[] = [
		pluginsIndexRoute,
		pluginsManageRoute.addChildren( [ pluginsManageIndexRoute, pluginRoute ] ),
		pluginsScheduledUpdatesRoute.addChildren( [
			pluginsScheduledUpdatesIndexRoute,
			pluginsScheduledUpdatesNewRoute,
			pluginsScheduledUpdatesEditRoute,
		] ),
	];

	return [ pluginsRoute.addChildren( childRoutes ) ];
};
