import {
	pluginsQuery,
	sitesQuery,
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

export const pluginRoute = createRoute( {
	head: ( { params } ) => ( {
		meta: [
			{
				title: params.pluginId,
			},
		],
	} ),
	getParentRoute: () => pluginsRoute,
	path: '$pluginId',
	loader: async () => {
		queryClient.ensureQueryData( marketplacePluginsQuery() );
		await queryClient.ensureQueryData( pluginsQuery() );
	},
} ).lazy( () =>
	import( '../../plugins/plugin' ).then( ( d ) =>
		createLazyRoute( 'plugin' )( {
			component: d.default,
		} )
	)
);

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
		queryClient.ensureQueryData( marketplacePluginsQuery() );
		queryClient.ensureQueryData( pluginsQuery() );
		await queryClient.ensureQueryData( rawUserPreferencesQuery() );
	},
} ).lazy( () =>
	import( '../../plugins/manage' ).then( ( d ) =>
		createLazyRoute( 'plugins-manage' )( {
			component: d.default,
		} )
	)
);

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
	getParentRoute: () => pluginsRoute,
	path: 'scheduled-updates/new',
	loader: () => {
		queryClient.ensureQueryData( sitesQuery() );
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
	getParentRoute: () => pluginsRoute,
	path: 'scheduled-updates/edit/$scheduleId',
	loader: () => {
		queryClient.ensureQueryData( sitesQuery() );
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
		pluginRoute,
		pluginsManageRoute,
		pluginsScheduledUpdatesRoute,
		pluginsScheduledUpdatesNewRoute,
		pluginsScheduledUpdatesEditRoute,
	];
	return [ pluginsRoute.addChildren( childRoutes ) ];
};
