import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { dashboardRedirect } from './redirect';
import { rootRoute } from './root';
import type { AnyRoute } from '@tanstack/react-router';

// URL segments for the left-sidebar categories; the screen maps them to the
// engine's filter names ('subscribers' → 'follows'). Kept as plain strings so
// this eagerly-loaded module never imports the notifications engine.
const INBOX_CATEGORIES = [ 'unread', 'comments', 'subscribers', 'likes' ];

type InboxSearch = { note: string | undefined };

const validateSearch = ( search: Record< string, unknown > ): InboxSearch => ( {
	note: typeof search.note === 'string' ? search.note : undefined,
} );

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
	validateSearch,
} ).lazy( () =>
	import( '../../notifications' ).then( ( d ) =>
		createLazyRoute( 'notifications-inbox' )( {
			component: () => (
				<d.default category="all" note={ notificationsInboxIndexRoute.useSearch().note } />
			),
		} )
	)
);

export const notificationsInboxCategoryRoute = createRoute( {
	getParentRoute: () => notificationsInboxRoute,
	path: '$category',
	validateSearch,
	beforeLoad: ( { params } ) => {
		// Old /notifications/<noteId> detail links resolve into the in-page
		// selection; anything else unknown falls back to the inbox.
		if ( /^\d+$/.test( params.category ) ) {
			throw dashboardRedirect( {
				to: '/notifications',
				search: { note: params.category },
				replace: true,
			} );
		}
		if ( ! INBOX_CATEGORIES.includes( params.category ) ) {
			throw dashboardRedirect( { to: '/notifications', replace: true } );
		}
	},
} ).lazy( () =>
	import( '../../notifications' ).then( ( d ) =>
		createLazyRoute( 'notifications-inbox-category' )( {
			component: () => (
				<d.default
					category={ notificationsInboxCategoryRoute.useParams().category }
					note={ notificationsInboxCategoryRoute.useSearch().note }
				/>
			),
		} )
	)
);

export const createNotificationsInboxRoutes = (): AnyRoute[] => [
	notificationsInboxRoute.addChildren( [
		notificationsInboxIndexRoute,
		notificationsInboxCategoryRoute,
	] ),
];
