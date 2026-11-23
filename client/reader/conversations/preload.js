import { readConversationsQuery } from '@automattic/api-queries';
import { whenSettled } from 'calypso/blocks/comments/use-page-settled';

export const loadInbox = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-conversations-inbox" */ 'calypso/reader/conversations/inbox'
	).then( ( { ConversationsInbox } ) => ( { default: ConversationsInbox } ) );

export const prefetchInbox = ( queryClient ) =>
	queryClient.prefetchInfiniteQuery( { ...readConversationsQuery(), staleTime: Infinity } );

let hasPreloaded = false;

/**
 * Warms the inbox's code and first page once per page load. Unlike prefetchInbox(), it refreshes a
 * persisted page too, which warms the route's server-side cache of the user's blogs.
 */
export function preloadInbox( queryClient ) {
	if ( hasPreloaded ) {
		return;
	}
	hasPreloaded = true;
	whenSettled().then( () => {
		loadInbox();
		queryClient.prefetchInfiniteQuery( readConversationsQuery() );
	} );
}
