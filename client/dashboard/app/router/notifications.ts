import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { rootRoute } from './root';

export const notificationsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Notifications' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'notifications',
	validateSearch: ( search ): { filter?: 'unread' } => ( {
		filter: search.filter === 'unread' ? 'unread' : undefined,
	} ),
} ).lazy( () =>
	import( '../../notifications' ).then( ( d ) =>
		createLazyRoute( 'notifications' )( {
			component: d.default,
		} )
	)
);

export const notificationsIndexRoute = createRoute( {
	getParentRoute: () => notificationsRoute,
	path: '/',
} );

export const notificationRoute = createRoute( {
	getParentRoute: () => notificationsRoute,
	path: '$noteId',
} );

export const createNotificationsRoutes = () => [
	notificationsRoute.addChildren( [ notificationsIndexRoute, notificationRoute ] ),
];
