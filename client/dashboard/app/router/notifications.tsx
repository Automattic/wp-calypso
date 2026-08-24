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
} ).lazy( () =>
	import( '../../notifications' ).then( ( d ) =>
		createLazyRoute( 'notifications-inbox' )( {
			component: d.default,
		} )
	)
);

export const createNotificationsInboxRoutes = (): AnyRoute[] => [ notificationsInboxRoute ];
