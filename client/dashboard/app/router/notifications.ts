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
	validateSearch: ( search ): { filter?: string } => ( {
		filter: typeof search.filter === 'string' ? search.filter : undefined,
	} ),
} ).lazy( () =>
	import( '../../notifications' ).then( ( d ) =>
		createLazyRoute( 'notifications' )( {
			component: d.default,
		} )
	)
);

export const createNotificationsRoutes = () => [ notificationsRoute ];
