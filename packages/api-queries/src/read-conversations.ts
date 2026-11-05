import {
	fetchReadConversationsList,
	fetchReadConversationsComments,
	markNotificationsRead,
	type ReadConversation,
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
	} );

/**
 * Applies `update` to every loaded conversation in every list query. Structural
 * sharing keeps unchanged pages and rows at their old references.
 */
function updateReadConversations(
	queryClient: QueryClient,
	update: ( conversation: ReadConversation ) => ReadConversation
) {
	queryClient.setQueriesData< ReadConversationsInfiniteData >(
		{ queryKey: getReadConversationsListQueryKey() },
		( data ) =>
			data && {
				...data,
				pages: data.pages.map( ( page ) => ( {
					...page,
					conversations: page.conversations.map( update ),
				} ) ),
			}
	);
}

const markReadMutationKey = [ ...getReadConversationsQueryKeyPrefix(), 'mark-read' ];

// Overlapping marks refetch once, when the last one settles, if any of them needed it.
const pendingRefetch = new WeakSet< QueryClient >();

// Mark-read patches the conversations and the comment notes.
const getMarkReadQueryKeys = () => [
	getReadConversationsListQueryKey(),
	getNotificationsQueryKey(),
];

/**
 * Marks comment notes read and clears them from the loaded conversations right
 * away. The route sends at most 50 note ids per conversation, so one with more
 * is refetched afterward to get the rest, as is everything when the request fails.
 */
export const markReadConversationNotesMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationKey: markReadMutationKey,
		meta: { statId: 'read-conversation-mark-read' },
		mutationFn: markNotificationsRead,
		onMutate: async ( noteIds: number[] ) => {
			const queryKeys = getMarkReadQueryKeys();
			// A refetch cancelled here, such as an earlier mark's, has to run again later.
			if ( queryKeys.some( ( queryKey ) => queryClient.isFetching( { queryKey } ) ) ) {
				pendingRefetch.add( queryClient );
			}
			await Promise.all(
				queryKeys.map( ( queryKey ) => queryClient.cancelQueries( { queryKey } ) )
			);
			markCachedNotesRead( queryClient, noteIds );
			const ids = new Set( noteIds );
			const cleared = new Set< string >();
			let hasMoreUnread = false;
			updateReadConversations( queryClient, ( conversation ) => {
				const unread = conversation.unread_note_ids.filter( ( id ) => ! ids.has( id ) );
				if ( unread.length === conversation.unread_note_ids.length ) {
					return conversation;
				}
				const unreadCount = Math.max(
					0,
					( conversation.unread_count ?? 0 ) -
						( conversation.unread_note_ids.length - unread.length )
				);
				if ( ! unreadCount ) {
					cleared.add( conversation.id );
				} else if ( ! unread.length ) {
					hasMoreUnread = true;
				}
				return { ...conversation, unread_note_ids: unread, unread_count: unreadCount };
			} );
			if ( cleared.size ) {
				// Only the first page's total is read.
				queryClient.setQueriesData< ReadConversationsInfiniteData >(
					{ queryKey: getReadConversationsListQueryKey() },
					( data ) =>
						data?.pages.length
							? {
									...data,
									pages: [
										{
											...data.pages[ 0 ],
											unread_total: Math.max( 0, data.pages[ 0 ].unread_total - cleared.size ),
										},
										...data.pages.slice( 1 ),
									],
								}
							: data
				);
			}
			return { hasMoreUnread };
		},
		// Refetching on error, rather than restoring a snapshot, keeps other marks made meanwhile.
		// Waiting for the last pending mark keeps the refetch from bringing back what it cleared.
		onSettled: ( _response, error, _noteIds, context ) => {
			if ( error || context?.hasMoreUnread ) {
				pendingRefetch.add( queryClient );
			}
			if (
				queryClient.isMutating( { mutationKey: markReadMutationKey } ) > 1 ||
				! pendingRefetch.delete( queryClient )
			) {
				return;
			}
			return Promise.all(
				getMarkReadQueryKeys().map( ( queryKey ) => queryClient.invalidateQueries( { queryKey } ) )
			);
		},
	} );
