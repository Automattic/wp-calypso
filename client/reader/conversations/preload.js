import { readConversationsQuery } from '@automattic/api-queries';

export const loadInbox = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-conversations-inbox" */ 'calypso/reader/conversations/inbox'
	).then( ( { ConversationsInbox } ) => ( { default: ConversationsInbox } ) );

/**
 * Fetches the inbox's first page, and only when nothing is cached. The inbox then shows the cached
 * page right away and refreshes it.
 */
export const prefetchInbox = ( queryClient ) =>
	queryClient.prefetchInfiniteQuery( { ...readConversationsQuery(), staleTime: Infinity } );

let hasPreloaded = false;

/**
 * Warms the inbox's code and first page once per page load, when the browser is idle. The request
 * also warms the route's server-side cache of the user's blogs, which a persisted page would skip.
 */
export function preloadInbox( queryClient ) {
	if ( hasPreloaded ) {
		return;
	}
	hasPreloaded = true;
	const preload = () => {
		loadInbox();
		queryClient.prefetchInfiniteQuery( readConversationsQuery() );
	};
	if ( typeof window.requestIdleCallback === 'function' ) {
		window.requestIdleCallback( preload );
	} else {
		setTimeout( preload, 2000 );
	}
}
