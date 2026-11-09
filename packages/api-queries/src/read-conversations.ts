import {
	fetchReadConversationsList,
	fetchReadConversationsComments,
	markNotificationsRead,
	unfollowReadConversation,
	type ReadConversationsResponse,
	type ReadConversationsScope,
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

/**
 * Refetching an infinite query refetches every loaded page in turn, so automatic
 * refetches stop once more than one is loaded.
 */
export const hasLoadedMorePages = ( { state }: { state: { data?: { pages: unknown[] } } } ) =>
	( state.data?.pages.length ?? 0 ) > 1;

const cursorPaging = {
	initialPageParam: undefined as string | undefined,
	getNextPageParam: ( lastPage: { next_cursor: string | null } ) =>
		lastPage.next_cursor ?? undefined,
	refetchOnWindowFocus: ( query: Parameters< typeof hasLoadedMorePages >[ 0 ] ) =>
		! hasLoadedMorePages( query ),
	refetchOnReconnect: ( query: Parameters< typeof hasLoadedMorePages >[ 0 ] ) =>
		! hasLoadedMorePages( query ),
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
	scope,
}: { sort?: ReadConversationsSort; search?: string; scope?: ReadConversationsScope } = {} ) =>
	infiniteQueryOptions( {
		queryKey: [ ...getReadConversationsListQueryKey(), { sort, search, scope } ],
		queryFn: ( { pageParam } ) =>
			fetchPageWithRows(
				( cursor ) =>
					fetchReadConversationsList( {
						scope,
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
 * @returns True when a conversation still has unread notes past the 50 the route lists,
 *          which only a refetch can show.
 */
function markCachedConversationNotesRead( queryClient: QueryClient, noteIds: number[] ) {
	const ids = new Set( noteIds );
	let hasUnlisted = false;
	queryClient.setQueriesData< ReadConversationsInfiniteData >(
		{ queryKey: getReadConversationsListQueryKey() },
		( data ) => {
			if ( ! data?.pages.length ) {
				return data;
			}
			let changed = false;
			let cleared = 0;
			const pages = data.pages.map( ( page ) => ( {
				...page,
				conversations: page.conversations.map( ( conversation ) => {
					const unread = conversation.unread_note_ids.filter( ( id ) => ! ids.has( id ) );
					const marked = conversation.unread_note_ids.length - unread.length;
					if ( ! marked ) {
						return conversation;
					}
					changed = true;
					const previousCount = conversation.unread_count ?? 0;
					const unreadCount = Math.max( 0, previousCount - marked );
					if ( previousCount && ! unreadCount ) {
						cleared++;
					}
					if ( unreadCount > unread.length ) {
						hasUnlisted = true;
					}
					return {
						...conversation,
						unread_note_ids: unread,
						unread_comment_ids: conversation.unread_comment_ids.filter(
							( _id, index ) => ! ids.has( conversation.unread_note_ids[ index ] )
						),
						unread_count: unreadCount,
					};
				} ),
			} ) );
			if ( ! changed ) {
				return data;
			}
			// Only the first page's total is read.
			pages[ 0 ] = {
				...pages[ 0 ],
				unread_total: Math.max( 0, pages[ 0 ].unread_total - cleared ),
			};
			// Structural sharing keeps unchanged pages and rows at their old references.
			return { ...data, pages };
		}
	);
	return hasUnlisted;
}

const markCachedRead = ( queryClient: QueryClient, noteIds: number[] ) => {
	markCachedNotesRead( queryClient, noteIds );
	return markCachedConversationNotesRead( queryClient, noteIds );
};

/**
 * Marks in flight per QueryClient. Tracked here rather than with `isMutating()`, which
 * still counts marks that settle in the same tick, so none would know it was the last.
 */
const pendingMarks = new WeakMap<
	QueryClient,
	{ count: number; noteIds: number[]; needsRefetch: boolean }
>();

const getMarkReadQueryKeys = () => [
	getReadConversationsListQueryKey(),
	getNotificationsQueryKey(),
];

/**
 * Marks comment notes read and clears them from the cached conversations and notes
 * right away. Once the last overlapping mark settles, the clears run again over
 * anything a poll or focus refetch fetched before the marks landed. The caches only
 * refetch when a mark fails or a conversation had notes past the route's 50 ids,
 * since refetching a list refetches every page loaded.
 */
export const markReadConversationNotesMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		meta: { statId: 'read-conversation-mark-read' },
		mutationFn: markNotificationsRead,
		onMutate: async ( noteIds: number[] ) => {
			const pending = pendingMarks.get( queryClient ) ?? {
				count: 0,
				noteIds: [],
				needsRefetch: false,
			};
			pending.count++;
			pending.noteIds.push( ...noteIds );
			pendingMarks.set( queryClient, pending );
			await Promise.all(
				getMarkReadQueryKeys().map( ( queryKey ) => queryClient.cancelQueries( { queryKey } ) )
			);
			pending.needsRefetch ||= markCachedRead( queryClient, noteIds );
		},
		// Waiting for the last mark keeps a refetch from bringing back what the others cleared.
		onSettled: async ( _data, error ) => {
			const pending = pendingMarks.get( queryClient );
			if ( ! pending ) {
				return;
			}
			pending.count--;
			pending.needsRefetch ||= !! error;
			if ( pending.count > 0 ) {
				return;
			}
			pendingMarks.delete( queryClient );
			const queryKeys = getMarkReadQueryKeys();
			// A fetch still in flight may predate the marks. Cancelling a first fetch leaves no
			// data, so those fetch again.
			await Promise.all(
				queryKeys.map( ( queryKey ) => queryClient.cancelQueries( { queryKey } ) )
			);
			markCachedRead( queryClient, pending.noteIds );
			await Promise.all(
				queryKeys.map( ( queryKey ) =>
					queryClient.invalidateQueries( {
						queryKey,
						predicate: ( query ) => pending.needsRefetch || query.state.data === undefined,
					} )
				)
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
