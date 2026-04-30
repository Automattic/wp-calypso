import {
	createConnection,
	createLike,
	deleteLike,
	getAuthorFeed,
	getAuthorProfile,
	getConnection,
	getConnections,
	getThread,
	getTimeline,
	PENDING_LIKE_URI,
	readerAtmosphereKeys,
} from '@automattic/api-core';
import {
	infiniteQueryOptions,
	queryOptions,
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
	type InfiniteData,
	type QueryClient,
	type QueryKey,
} from '@tanstack/react-query';
import type {
	AtmosphereAuthorFeedFilter,
	AtmosphereAuthorFeedPage,
	AtmosphereAuthorProfile,
	AtmosphereConnectionDetails,
	AtmosphereConnectionsResponse,
	AtmosphereCreateConnectionResponse,
	AtmosphereError,
	AtmosphereFeedItem,
	AtmosphereThreadResponse,
	AtmosphereTimelinePage,
	CreateConnectionParams,
	CreateLikeResult,
} from '@automattic/api-core';

const TERMINAL_ERROR_KINDS: ReadonlySet< AtmosphereError[ 'kind' ] > = new Set( [
	'auth_required',
	'auth_failed',
	'invalid_handle',
	'invalid_credentials',
	'connection_not_found',
	'not_found',
	'bad_request',
	// rate_limited surfaces a wait-then-Retry UI; auto-retrying immediately
	// would contradict the user-facing message.
	'rate_limited',
] );

const isTerminalError = ( error: AtmosphereError ): boolean =>
	TERMINAL_ERROR_KINDS.has( error.kind );

export const connectionsQueryOptions = () =>
	queryOptions< AtmosphereConnectionsResponse, AtmosphereError >( {
		queryKey: readerAtmosphereKeys.connections(),
		queryFn: getConnections,
		staleTime: 60_000,
		retry: ( failureCount, error ) => {
			if ( isTerminalError( error ) ) {
				return false;
			}
			return failureCount < 2;
		},
	} );

export function useConnectionsQuery( { enabled }: { enabled?: boolean } = {} ) {
	return useQuery( { ...connectionsQueryOptions(), enabled } );
}

export function useCreateConnectionMutation() {
	const client = useQueryClient();
	return useMutation< AtmosphereCreateConnectionResponse, AtmosphereError, CreateConnectionParams >(
		{
			mutationFn: createConnection,
			onSuccess: () => {
				client.invalidateQueries( { queryKey: readerAtmosphereKeys.connections() } );
			},
		}
	);
}

export const connectionQueryOptions = ( id: number | null ) =>
	queryOptions< AtmosphereConnectionDetails, AtmosphereError >( {
		queryKey: readerAtmosphereKeys.connection( id ),
		queryFn: () => {
			if ( id === null || id <= 0 ) {
				// Defensive guard — `enabled` below should prevent this from
				// ever running. Throw the error type the query is typed for.
				const err: AtmosphereError = {
					kind: 'unknown',
					cause: new Error( `getConnection called with invalid id: ${ id }` ),
				};
				throw err;
			}
			return getConnection( id );
		},
		enabled: id !== null && id > 0,
		staleTime: 60_000,
	} );

export function useConnectionQuery( id: number | null ) {
	return useQuery( connectionQueryOptions( id ) );
}

export const timelineInfiniteQuery = ( connectionId: number ) =>
	infiniteQueryOptions<
		AtmosphereTimelinePage,
		AtmosphereError,
		InfiniteData< AtmosphereTimelinePage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerAtmosphereKeys.timeline( connectionId ),
		queryFn: ( { pageParam } ) => getTimeline( { connectionId, cursor: pageParam } ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage ) => lastPage.cursor || undefined,
		enabled: connectionId > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
	} );

export function useTimelineInfiniteQuery( connectionId: number ) {
	return useInfiniteQuery( timelineInfiniteQuery( connectionId ) );
}

export const threadQueryOptions = ( uri: string ) =>
	queryOptions< AtmosphereThreadResponse, AtmosphereError >( {
		queryKey: readerAtmosphereKeys.thread( uri ),
		queryFn: () => getThread( { uri } ),
		enabled: uri.length > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		retry: ( failureCount, error ) => {
			if ( isTerminalError( error ) ) {
				return false;
			}
			return failureCount < 2;
		},
	} );

export interface UseThreadQueryParams {
	uri: string;
}

export function useThreadQuery( { uri }: UseThreadQueryParams ) {
	return useQuery( threadQueryOptions( uri ) );
}

export const profileQueryOptions = ( actor: string ) =>
	queryOptions< AtmosphereAuthorProfile, AtmosphereError >( {
		queryKey: readerAtmosphereKeys.profile( actor ),
		queryFn: () => getAuthorProfile( { actor } ),
		enabled: actor.length > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
	} );

export interface UseAuthorProfileQueryParams {
	actor: string;
}

export function useAuthorProfileQuery( { actor }: UseAuthorProfileQueryParams ) {
	return useQuery( profileQueryOptions( actor ) );
}

export const authorFeedInfiniteQuery = ( actor: string, filter?: AtmosphereAuthorFeedFilter ) => {
	// Collapse the default filter to undefined so the cache key and request
	// URL stay clean for the default tab. Callers can pass 'posts_no_replies'
	// without paying a cache-key change versus passing nothing at all —
	// matters for slice-6 cache compatibility. Centralized here (not in the
	// hook) so any direct factory caller gets the same behavior.
	const normalizedFilter = filter === 'posts_no_replies' ? undefined : filter;
	return infiniteQueryOptions<
		AtmosphereAuthorFeedPage,
		AtmosphereError,
		InfiniteData< AtmosphereAuthorFeedPage >,
		QueryKey,
		string | undefined
	>( {
		queryKey: readerAtmosphereKeys.authorFeed( actor, normalizedFilter ),
		queryFn: ( { pageParam } ) =>
			getAuthorFeed( { actor, cursor: pageParam, filter: normalizedFilter } ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage ) => lastPage.cursor || undefined,
		enabled: actor.length > 0,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
	} );
};

export interface UseAuthorFeedInfiniteQueryParams {
	actor: string;
	filter?: AtmosphereAuthorFeedFilter;
}

export function useAuthorFeedInfiniteQuery( { actor, filter }: UseAuthorFeedInfiniteQueryParams ) {
	return useInfiniteQuery( authorFeedInfiniteQuery( actor, filter ) );
}

interface OptimisticContext {
	snapshots: Array< {
		key: QueryKey;
		items: Array< { itemKey: string; occurrence: number; item: AtmosphereFeedItem } >;
	} >;
}

function getOptimisticItemKey( item: AtmosphereFeedItem ): string {
	if ( ! item.reason ) {
		return `${ item.uri }\nreason:none`;
	}
	return `${ item.uri }\nreason:${ item.reason.type }:${ item.reason.by.did }:${ item.reason.by.handle }`;
}

/**
 * Walk every cached `useTimelineInfiniteQuery` entry for the given
 * connection, find any page whose items contain the post by URI, and
 * apply `patch` to that item. Pages that don't contain the URI pass
 * through untouched. Returns the pre-mutation items so `onError` can
 * roll back only this post without clobbering other optimistic updates.
 */
function patchTimelineCache(
	queryClient: QueryClient,
	connectionId: number,
	postUri: string,
	patch: ( item: AtmosphereFeedItem ) => AtmosphereFeedItem
): OptimisticContext {
	const key = readerAtmosphereKeys.timeline( connectionId );
	const items: OptimisticContext[ 'snapshots' ][ number ][ 'items' ] = [];
	const seenOccurrences = new Map< string, number >();
	const data = queryClient.getQueryData< InfiniteData< AtmosphereTimelinePage > >( key );
	if ( ! data ) {
		return { snapshots: [ { key, items } ] };
	}
	queryClient.setQueryData< InfiniteData< AtmosphereTimelinePage > >( key, {
		...data,
		pages: data.pages.map( ( page ) => ( {
			...page,
			items: page.items.map( ( item ) => {
				if ( item.uri !== postUri ) {
					return item;
				}
				const itemKey = getOptimisticItemKey( item );
				const occurrence = seenOccurrences.get( itemKey ) ?? 0;
				seenOccurrences.set( itemKey, occurrence + 1 );
				items.push( { itemKey, occurrence, item } );
				return patch( item );
			} ),
		} ) ),
	} );
	return { snapshots: [ { key, items } ] };
}

function restoreTimelineSnapshots( queryClient: QueryClient, ctx: OptimisticContext | undefined ) {
	if ( ! ctx ) {
		return;
	}
	for ( const { key, items } of ctx.snapshots ) {
		if ( ! items.length ) {
			continue;
		}
		const current = queryClient.getQueryData< InfiniteData< AtmosphereTimelinePage > >( key );
		if ( ! current ) {
			continue;
		}
		const itemSnapshots = new Map< string, AtmosphereFeedItem[] >();
		for ( const { itemKey, occurrence, item } of items ) {
			const snapshots = itemSnapshots.get( itemKey ) ?? [];
			snapshots[ occurrence ] = item;
			itemSnapshots.set( itemKey, snapshots );
		}
		const seenOccurrences = new Map< string, number >();
		queryClient.setQueryData< InfiniteData< AtmosphereTimelinePage > >( key, {
			...current,
			pages: current.pages.map( ( page ) => ( {
				...page,
				items: page.items.map( ( item ) => {
					const itemKey = getOptimisticItemKey( item );
					const snapshots = itemSnapshots.get( itemKey );
					if ( ! snapshots ) {
						return item;
					}
					const occurrence = seenOccurrences.get( itemKey ) ?? 0;
					seenOccurrences.set( itemKey, occurrence + 1 );
					return snapshots[ occurrence ] ?? item;
				} ),
			} ) ),
		} );
	}
}

export function useCreateLikeMutation( connectionId: number ) {
	const queryClient = useQueryClient();
	return useMutation<
		CreateLikeResult,
		AtmosphereError,
		{ postUri: string; postCid: string },
		OptimisticContext
	>( {
		mutationFn: ( { postUri, postCid } ) => createLike( { connectionId, postUri, postCid } ),
		onMutate: async ( { postUri } ) => {
			await queryClient.cancelQueries( {
				queryKey: readerAtmosphereKeys.timeline( connectionId ),
			} );
			return patchTimelineCache( queryClient, connectionId, postUri, ( item ) => ( {
				...item,
				viewer: {
					like: PENDING_LIKE_URI,
					repost: item.viewer?.repost ?? null,
				},
				counts: { ...item.counts, likes: item.counts.likes + 1 },
			} ) );
		},
		onError: ( _err, _vars, ctx ) => restoreTimelineSnapshots( queryClient, ctx ),
		onSuccess: ( result, { postUri } ) => {
			patchTimelineCache( queryClient, connectionId, postUri, ( item ) => ( {
				...item,
				viewer: {
					like: result.uri,
					repost: item.viewer?.repost ?? null,
				},
			} ) );
		},
	} );
}

export function useDeleteLikeMutation( connectionId: number ) {
	const queryClient = useQueryClient();
	return useMutation< void, AtmosphereError, { rkey: string; postUri: string }, OptimisticContext >(
		{
			mutationFn: ( { rkey } ) => deleteLike( { connectionId, rkey } ),
			onMutate: async ( { postUri } ) => {
				await queryClient.cancelQueries( {
					queryKey: readerAtmosphereKeys.timeline( connectionId ),
				} );
				return patchTimelineCache( queryClient, connectionId, postUri, ( item ) => ( {
					...item,
					viewer: {
						like: null,
						repost: item.viewer?.repost ?? null,
					},
					counts: { ...item.counts, likes: Math.max( 0, item.counts.likes - 1 ) },
				} ) );
			},
			onError: ( _err, _vars, ctx ) => restoreTimelineSnapshots( queryClient, ctx ),
		}
	);
}
