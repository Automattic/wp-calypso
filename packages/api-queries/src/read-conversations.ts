import {
	fetchReadConversationsList,
	fetchReadConversationsComments,
	markNotificationsRead,
	unfollowReadConversation,
	type ReadConversationsResponse,
	type ReadConversationsSort,
} from '@automattic/api-core';
import {
	infiniteQueryOptions,
	mutationOptions,
	type InfiniteData,
	type QueryClient,
} from '@tanstack/react-query';
import { getNotificationsQueryKey, markCachedNotesRead } from './notifications';

const PAGE_SIZE = 20;

/**
 * The routes drop posts the user can no longer read after paging, so a page can
 * come back empty with a cursor. Fetching on past those keeps every page useful;
 * the cap leaves the rest to the next scroll.
 */
const MAX_EMPTY_PAGES = 5;

async function fetchPageWithRows< Page extends { next_cursor: string | null } >(
	fetchPage: ( cursor?: string ) => Promise< Page >,
	countRows: ( page: Page ) => number,
	cursor?: string
): Promise< Page > {
	let page = await fetchPage( cursor );
	for (
		let skipped = 0;
		! countRows( page ) && page.next_cursor && skipped < MAX_EMPTY_PAGES;
		skipped++
	) {
		page = await fetchPage( page.next_cursor );
	}
	return page;
}

const cursorPaging = {
	initialPageParam: undefined as string | undefined,
	getNextPageParam: ( lastPage: { next_cursor: string | null } ) =>
		lastPage.next_cursor ?? undefined,
};

export type ReadConversationsInfiniteData = InfiniteData<
	ReadConversationsResponse,
	string | undefined
>;

/** Prefixes both routes' keys. */
const getReadConversationsQueryKeyPrefix = () => [ 'read', 'conversations' ] as const;

const getReadConversationsListQueryKey = () =>
	[ ...getReadConversationsQueryKeyPrefix(), 'list' ] as const;

export const readConversationsQuery = ( {
	sort = 'newest',
	search = '',
}: { sort?: ReadConversationsSort; search?: string } = {} ) =>
	infiniteQueryOptions( {
		queryKey: [ ...getReadConversationsListQueryKey(), { sort, search } ],
		queryFn: ( { pageParam } ) =>
			fetchPageWithRows(
				( cursor ) =>
					fetchReadConversationsList( {
						sort,
						search: search || undefined,
						number: PAGE_SIZE,
						cursor,
					} ),
				( page ) => page.conversations.length,
				pageParam
			),
		...cursorPaging,
		meta: { persist: false },
	} );

export const readConversationsCommentsQuery = ( {
	sort = 'newest',
	search = '',
}: { sort?: ReadConversationsSort; search?: string } = {} ) =>
	infiniteQueryOptions( {
		queryKey: [ ...getReadConversationsQueryKeyPrefix(), 'comments', { sort, search } ],
		queryFn: ( { pageParam } ) =>
			fetchPageWithRows(
				( cursor ) =>
					fetchReadConversationsComments( {
						sort,
						search: search || undefined,
						number: PAGE_SIZE,
						cursor,
					} ),
				( page ) => page.comments.length,
				pageParam
			),
		...cursorPaging,
		meta: { persist: false },
	} );

/**
 * Clears the marked notes from every loaded conversation. Each list lowers its own
 * `unread_total` by the conversations it clears, so lists cached at different
 * times don't lower each other's totals.
 */
function markCachedConversationNotesRead( queryClient: QueryClient, noteIds: number[] ) {
	const ids = new Set( noteIds );
	queryClient.setQueriesData< ReadConversationsInfiniteData >(
		{ queryKey: getReadConversationsListQueryKey() },
		( data ) => {
			if ( ! data?.pages.length ) {
				return data;
			}
			let cleared = 0;
			const pages = data.pages.map( ( page ) => ( {
				...page,
				conversations: page.conversations.map( ( conversation ) => {
					const unread = conversation.unread_note_ids.filter( ( id ) => ! ids.has( id ) );
					const marked = conversation.unread_note_ids.length - unread.length;
					if ( ! marked ) {
						return conversation;
					}
					const previousCount = conversation.unread_count ?? 0;
					const unreadCount = Math.max( 0, previousCount - marked );
					if ( previousCount && ! unreadCount ) {
						cleared++;
					}
					return { ...conversation, unread_note_ids: unread, unread_count: unreadCount };
				} ),
			} ) );
			// Only the first page's total is read.
			pages[ 0 ] = {
				...pages[ 0 ],
				unread_total: Math.max( 0, pages[ 0 ].unread_total - cleared ),
			};
			// Structural sharing keeps unchanged pages and rows at their old references.
			return { ...data, pages };
		}
	);
}

/**
 * Marks in flight per QueryClient. Counted here rather than with `isMutating()`,
 * which still counts marks that settle in the same tick, so none would refetch.
 */
const pendingMarks = new WeakMap< QueryClient, number >();

const getMarkReadQueryKeys = () => [
	getReadConversationsListQueryKey(),
	getNotificationsQueryKey(),
];

/**
 * Marks comment notes read and clears them from the cached conversations and notes
 * right away. Both refetch once the last overlapping mark settles. That picks up
 * notes past the route's 50 ids per conversation, undoes a failed mark, and replaces
 * anything a poll or focus refetch fetched before the mark landed.
 */
export const markReadConversationNotesMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		meta: { statId: 'read-conversation-mark-read' },
		mutationFn: markNotificationsRead,
		onMutate: async ( noteIds: number[] ) => {
			pendingMarks.set( queryClient, ( pendingMarks.get( queryClient ) ?? 0 ) + 1 );
			await Promise.all(
				getMarkReadQueryKeys().map( ( queryKey ) => queryClient.cancelQueries( { queryKey } ) )
			);
			markCachedNotesRead( queryClient, noteIds );
			markCachedConversationNotesRead( queryClient, noteIds );
		},
		// Refetching rather than restoring a snapshot keeps other marks made meanwhile, and
		// waiting for the last one keeps the refetch from bringing back what they cleared.
		onSettled: async () => {
			const pending = Math.max( 0, ( pendingMarks.get( queryClient ) ?? 0 ) - 1 );
			pendingMarks.set( queryClient, pending );
			if ( pending ) {
				return;
			}
			const queryKeys = getMarkReadQueryKeys();
			// Invalidating joins a first fetch still in flight, which may predate the mark.
			await Promise.all(
				queryKeys.map( ( queryKey ) => queryClient.cancelQueries( { queryKey } ) )
			);
			await Promise.all(
				queryKeys.map( ( queryKey ) => queryClient.invalidateQueries( { queryKey } ) )
			);
		},
	} );

export const unfollowReadConversationMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		meta: { statId: 'read-conversation-unfollow' },
		mutationFn: async ( params: { blogId: number; postId: number } ) => {
			const response = await unfollowReadConversation( params );
			if ( ! response.success ) {
				throw new Error( 'The conversation was not unfollowed.' );
			}
			return response;
		},
		onSuccess: async ( _response, { blogId, postId } ) => {
			const queryKey = getReadConversationsListQueryKey();
			// A list fetched before the unfollow would otherwise land after it and follow again.
			// Lists still on their first fetch keep it, since cancelling would leave them empty.
			await queryClient.cancelQueries( {
				queryKey,
				predicate: ( query ) => query.state.data !== undefined,
			} );
			queryClient.setQueriesData< ReadConversationsInfiniteData >(
				{ queryKey },
				( data ) =>
					data && {
						...data,
						pages: data.pages.map( ( page ) => ( {
							...page,
							conversations: page.conversations.map( ( conversation ) =>
								conversation.blog_id === blogId && conversation.post_id === postId
									? { ...conversation, is_following: false }
									: conversation
							),
						} ) ),
					}
			);
		},
	} );
