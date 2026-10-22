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
} );

export const notificationsIndexRoute = createRoute( {
	getParentRoute: () => notificationsRoute,
	path: '/',
} ).lazy( () =>
	import( '../../notifications' ).then( ( d ) =>
		createLazyRoute( 'notifications' )( {
			component: d.default,
		} )
	)
);

export const notificationRoute = createRoute( {
	getParentRoute: () => notificationsIndexRoute,
	path: '$noteId',
} );

export const createNotificationsRoutes = () => [
	notificationsRoute.addChildren( [
		notificationsIndexRoute.addChildren( [ notificationRoute ] ),
	] ),
];
