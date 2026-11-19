import {
	fetchReadConversationsList,
	fetchReadConversationsComments,
	markNotificationsRead,
	unfollowReadConversation,
	type ReadConversation,
	type ReadConversationsCommentsResponse,
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

type ReadConversationsCommentsInfiniteData = InfiniteData<
	ReadConversationsCommentsResponse,
	string | undefined
>;

/** Prefixes both routes' keys. */
const getReadConversationsQueryKeyPrefix = () => [ 'read', 'conversations' ] as const;

const getReadConversationsListQueryKey = () =>
	[ ...getReadConversationsQueryKeyPrefix(), 'list' ] as const;

const getReadConversationsCommentsQueryKey = () =>
	[ ...getReadConversationsQueryKeyPrefix(), 'comments' ] as const;

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
		// Long enough that a prefetched list isn't fetched again when the inbox mounts.
		staleTime: 30 * 1000,
		meta: { persist: false },
	} );

export const readConversationsCommentsQuery = ( {
	sort = 'newest',
	search = '',
}: { sort?: ReadConversationsSort; search?: string } = {} ) =>
	infiniteQueryOptions( {
		queryKey: [ ...getReadConversationsCommentsQueryKey(), { sort, search } ],
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

type UnreadRow = Pick<
	ReadConversation,
	'blog_id' | 'post_id' | 'unread_count' | 'unread_note_ids' | 'unread_comment_ids'
>;

const getConversationKey = ( { blog_id, post_id }: UnreadRow ) => `${ blog_id }-p-${ post_id }`;

/**
 * Clears the marked notes from every loaded conversation and Your comments row. Each
 * list lowers its own `unread_total` by the conversations it clears, so lists cached at
 * different times don't lower each other's totals. A conversation only Your comments
 * lists still counts against each list, which hasn't paged that far.
 * @returns True when a conversation still has unread notes past the 50 the route lists,
 *          which only a refetch can show.
 */
function markCachedConversationNotesRead( queryClient: QueryClient, noteIds: number[] ) {
	const ids = new Set( noteIds );
	let hasUnlisted = false;
	/** @returns The rows, at their old reference when untouched, and the keys left with nothing unread. */
	const clearRows = < Row extends UnreadRow >( rows: Row[] ) => {
		const cleared: string[] = [];
		let changed = false;
		const result = rows.map( ( row ) => {
			const unread = row.unread_note_ids.filter( ( id ) => ! ids.has( id ) );
			const marked = row.unread_note_ids.length - unread.length;
			if ( ! marked ) {
				return row;
			}
			changed = true;
			const previousCount = row.unread_count ?? 0;
			const unreadCount = Math.max( 0, previousCount - marked );
			if ( previousCount && ! unreadCount ) {
				cleared.push( getConversationKey( row ) );
			}
			if ( unreadCount > unread.length ) {
				hasUnlisted = true;
			}
			return {
				...row,
				unread_note_ids: unread,
				unread_comment_ids: row.unread_comment_ids.filter(
					( _id, index ) => ! ids.has( row.unread_note_ids[ index ] )
				),
				unread_count: unreadCount,
			};
		} );
		return { rows: changed ? result : rows, cleared };
	};

	const clearedComments = new Set< string >();
	queryClient.setQueriesData< ReadConversationsCommentsInfiniteData >(
		{ queryKey: getReadConversationsCommentsQueryKey() },
		( data ) => {
			if ( ! data?.pages.length ) {
				return data;
			}
			let changed = false;
			const pages = data.pages.map( ( page ) => {
				const { rows, cleared } = clearRows( page.comments );
				cleared.forEach( ( key ) => clearedComments.add( key ) );
				if ( rows === page.comments ) {
					return page;
				}
				changed = true;
				return { ...page, comments: rows };
			} );
			// Structural sharing keeps unchanged pages and rows at their old references.
			return changed ? { ...data, pages } : data;
		}
	);

	queryClient.setQueriesData< ReadConversationsInfiniteData >(
		{ queryKey: getReadConversationsListQueryKey() },
		( data ) => {
			if ( ! data?.pages.length ) {
				return data;
			}
			const listed = new Set(
				data.pages.flatMap( ( page ) => page.conversations.map( getConversationKey ) )
			);
			let cleared = [ ...clearedComments ].filter( ( key ) => ! listed.has( key ) ).length;
			let changed = cleared > 0;
			const pages = data.pages.map( ( page ) => {
				const result = clearRows( page.conversations );
				cleared += result.cleared.length;
				if ( result.rows === page.conversations ) {
					return page;
				}
				changed = true;
				return { ...page, conversations: result.rows };
			} );
			if ( ! changed ) {
				return data;
			}
			// Only the first page's total is read.
			pages[ 0 ] = {
				...pages[ 0 ],
				unread_total: Math.max( 0, pages[ 0 ].unread_total - cleared ),
			};
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
	getReadConversationsQueryKeyPrefix(),
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
