import { readConversationsQuery } from '@automattic/api-queries';
import { whenSettled } from 'calypso/blocks/comments/use-page-settled';

export const loadInbox = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-conversations-inbox" */ 'calypso/reader/conversations/inbox'
	).then( ( { ConversationsInbox } ) => ( { default: ConversationsInbox } ) );

/**
 * Once the page settles, warms the inbox's code and refreshes its persisted first page, which also
 * warms the route's server-side cache of the user's blogs. Only readers who've opened the inbox
 * have a persisted page, so the rest send no request.
 */
export function preloadInbox( queryClient ) {
	const query = readConversationsQuery();
	if ( ! queryClient.getQueryData( query.queryKey ) ) {
		return;
	}
	whenSettled().then( () => {
		loadInbox();
		queryClient.prefetchInfiniteQuery( query );
	} );
}
