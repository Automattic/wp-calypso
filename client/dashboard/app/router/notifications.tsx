import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { isInboxCategory, isNoteId } from './notifications-segments';
import { dashboardRedirect } from './redirect';
import { rootRoute } from './root';
import type { AnyRoute } from '@tanstack/react-router';

type InboxSearch = { note: string | undefined };

// `?note=` was the old home for the selection. Reading it keeps those links
// working; each route redirects them to the path form.
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
	beforeLoad: ( { search } ) => {
		if ( search.note && isNoteId( search.note ) ) {
			throw dashboardRedirect( {
				to: '/notifications/$category',
				params: { category: search.note },
				replace: true,
			} );
		}
	},
} ).lazy( () =>
	import( '../../notifications' ).then( ( d ) =>
		createLazyRoute( 'notifications-inbox' )( {
			component: () => <d.default category="all" note={ undefined } />,
		} )
	)
);

// Carries either a category or a note id: /notifications/<noteId> selects a
// note in the unfiltered list, which is also the shape of the old detail links.
export const notificationsInboxCategoryRoute = createRoute( {
	getParentRoute: () => notificationsInboxRoute,
	path: '$category',
	validateSearch,
	beforeLoad: ( { params, search } ) => {
		if ( isNoteId( params.category ) ) {
			return;
		}
		if ( ! isInboxCategory( params.category ) ) {
			throw dashboardRedirect( { to: '/notifications', replace: true } );
		}
		if ( search.note && isNoteId( search.note ) ) {
			throw dashboardRedirect( {
				to: '/notifications/$category/$noteId',
				params: { category: params.category, noteId: search.note },
				replace: true,
			} );
		}
	},
} ).lazy( () =>
	import( '../../notifications' ).then( ( d ) =>
		createLazyRoute( 'notifications-inbox-category' )( {
			component: () => {
				const { category } = notificationsInboxCategoryRoute.useParams();
				return isNoteId( category ) ? (
					<d.default category="all" note={ category } />
				) : (
					<d.default category={ category } note={ undefined } />
				);
			},
		} )
	)
);

export const notificationsInboxNoteRoute = createRoute( {
	getParentRoute: () => notificationsInboxRoute,
	path: '$category/$noteId',
	beforeLoad: ( { params } ) => {
		if ( ! isInboxCategory( params.category ) ) {
			throw dashboardRedirect( { to: '/notifications', replace: true } );
		}
		if ( ! isNoteId( params.noteId ) ) {
			throw dashboardRedirect( {
				to: '/notifications/$category',
				params: { category: params.category },
				replace: true,
			} );
		}
	},
} ).lazy( () =>
	import( '../../notifications' ).then( ( d ) =>
		createLazyRoute( 'notifications-inbox-note' )( {
			component: () => {
				const { category, noteId } = notificationsInboxNoteRoute.useParams();
				return <d.default category={ category } note={ noteId } />;
			},
		} )
	)
);

export const createNotificationsInboxRoutes = (): AnyRoute[] => [
	notificationsInboxRoute.addChildren( [
		notificationsInboxIndexRoute,
		notificationsInboxCategoryRoute,
		notificationsInboxNoteRoute,
	] ),
];
