import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { rootRoute } from './root';
import type { AnyRoute } from '@tanstack/react-router';

export const notificationsInboxRoute = createRoute( {
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

export const notificationsInboxIndexRoute = createRoute( {
	getParentRoute: () => notificationsInboxRoute,
	path: '/',
} ).lazy( () =>
	import( '../../notifications' ).then( ( d ) =>
		createLazyRoute( 'notifications-inbox' )( {
			component: d.default,
		} )
	)
);

export const notificationsInboxNoteRoute = createRoute( {
	getParentRoute: () => notificationsInboxRoute,
	path: '$noteId',
} ).lazy( () =>
	import( '../../notifications/note' ).then( ( d ) =>
		createLazyRoute( 'notifications-inbox-note' )( {
			component: () => <d.default noteId={ notificationsInboxNoteRoute.useParams().noteId } />,
		} )
	)
);

export const createNotificationsInboxRoutes = (): AnyRoute[] => [
	notificationsInboxRoute.addChildren( [
		notificationsInboxIndexRoute,
		notificationsInboxNoteRoute,
	] ),
];
