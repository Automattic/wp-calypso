import { getStreamType, readStreamQuery } from '@automattic/api-queries';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { syncConversationFollowStatus, syncPostCache } from 'calypso/reader/data/post-cache-sync';
import { useDispatch } from 'calypso/state';
import { buildStreamQueryParams } from '../../build-query-params';
import { normalizeStreamPage, PER_FETCH } from '../../normalization';
import { combineXPosts } from '../../utils';
import type { PaddingStreamItem, StreamItem, StreamListItem } from '../../types';
import type { ReadStreamQueryParams, ReadStreamResponse } from '@automattic/api-core';
import type { Dispatch } from 'redux';

interface UsePaginatedStreamOptions {
	streamKey: string;
	page: number;
	perPage: number;
	localeSlug?: string | null;
}

type PaginatedStreamFetchOptions = UsePaginatedStreamOptions;

export interface PaginatedStreamData {
	items: StreamListItem[];
	pagination: {
		totalItems: number;
		totalPages: number;
	};
	isRequesting: boolean;
	error: unknown;
}

type PaginatedStreamQueryKey = readonly [
	'read',
	'stream',
	string,
	{ page: number; perPage: number; localeSlug: string | null },
];

export const getPaginatedStreamQueryKeyPrefix = ( streamKey: string ) =>
	[ 'read', 'stream', streamKey ] as const;

export const invalidatePaginatedStream = ( queryClient: QueryClient, streamKey: string ) => {
	queryClient.invalidateQueries( { queryKey: getPaginatedStreamQueryKeyPrefix( streamKey ) } );
};

const getPaginatedStreamQueryParams = ( {
	streamKey,
	page,
	perPage,
	localeSlug = null,
}: PaginatedStreamFetchOptions ): ReadStreamQueryParams =>
	buildStreamQueryParams( {
		streamKey,
		page,
		perPage,
		localeSlug,
		feedId: null,
		pageHandle: null,
		isPoll: false,
		gap: null,
	} ) as ReadStreamQueryParams;

const getPaginatedStreamQueryOptions = ( {
	streamKey,
	page,
	perPage,
	localeSlug = null,
}: PaginatedStreamFetchOptions ) =>
	readStreamQuery(
		streamKey,
		getPaginatedStreamQueryParams( { streamKey, page, perPage, localeSlug } ),
		{ page, perPage, localeSlug }
	);

const syncPaginatedStreamPage = (
	queryClient: QueryClient,
	dispatch: Dispatch,
	data: ReadStreamResponse,
	streamKey: string
) => {
	const { streamPosts } = normalizeStreamPage( data, getStreamType( streamKey ) );
	if ( streamPosts.length > 0 ) {
		syncPostCache( queryClient, streamPosts );
		syncConversationFollowStatus( dispatch, streamPosts );
	}
};

export const fetchPaginatedStream = async (
	queryClient: QueryClient,
	dispatch: Dispatch,
	options: PaginatedStreamFetchOptions
) => {
	const data = await queryClient.fetchQuery( {
		...getPaginatedStreamQueryOptions( options ),
		staleTime: 0,
	} );
	syncPaginatedStreamPage( queryClient, dispatch, data, options.streamKey );
	return data;
};

const isPaginatedStreamQueryKey = (
	queryKey: unknown,
	streamKey: string
): queryKey is PaginatedStreamQueryKey => {
	if ( ! Array.isArray( queryKey ) || queryKey.length !== 4 ) {
		return false;
	}
	return queryKey[ 0 ] === 'read' && queryKey[ 1 ] === 'stream' && queryKey[ 2 ] === streamKey;
};

const getPageFromQueryKey = ( queryKey: PaginatedStreamQueryKey ) => queryKey[ 3 ].page;

const getLocaleSlugFromQueryKey = ( queryKey: PaginatedStreamQueryKey ) =>
	queryKey[ 3 ].localeSlug ?? null;

const getPaginationFromResponse = (
	data: ReadStreamResponse | undefined,
	perPage: number,
	fallbackItemCount: number
) => {
	const totalItems = data?.total_cards || data?.found || fallbackItemCount;
	const totalPages = data?.total_pages || Math.ceil( totalItems / ( perPage || PER_FETCH ) );
	return { totalItems, totalPages };
};

const getPaginatedStreamItems = (
	queryClient: QueryClient,
	streamKey: string,
	perPage: number,
	localeSlug: string | null
): StreamListItem[] => {
	const streamType = getStreamType( streamKey );
	const cachedEntries = queryClient
		.getQueriesData< ReadStreamResponse >( {
			queryKey: getPaginatedStreamQueryKeyPrefix( streamKey ),
		} )
		.filter( ( entry ): entry is [ PaginatedStreamQueryKey, ReadStreamResponse ] => {
			const [ queryKey, data ] = entry;
			return !! data && isPaginatedStreamQueryKey( queryKey, streamKey );
		} )
		.filter( ( [ queryKey ] ) => queryKey[ 3 ].perPage === perPage )
		.filter( ( [ queryKey ] ) => getLocaleSlugFromQueryKey( queryKey ) === localeSlug )
		.sort(
			( [ firstKey ], [ secondKey ] ) =>
				getPageFromQueryKey( firstKey ) - getPageFromQueryKey( secondKey )
		);

	const items: StreamItem[] = [];
	let itemCount = 0;
	for ( const [ queryKey, data ] of cachedEntries ) {
		const startIndex = ( getPageFromQueryKey( queryKey ) - 1 ) * perPage;
		const { streamItems } = normalizeStreamPage( data, streamType );
		for ( let i = 0; i < streamItems.length; i++ ) {
			items[ startIndex + i ] = streamItems[ i ];
		}
		itemCount = Math.max( itemCount, startIndex + streamItems.length );
	}

	const paddedItems = Array.from(
		{ length: itemCount },
		( _, index ): StreamItem | PaddingStreamItem =>
			items[ index ] ?? { isPadding: true, postId: `padding-${ index }` }
	);
	return combineXPosts( paddedItems ) as StreamListItem[];
};

export const usePaginatedStream = ( {
	streamKey,
	page,
	perPage,
	localeSlug = null,
}: UsePaginatedStreamOptions ): PaginatedStreamData => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const processedPages = useRef< WeakSet< ReadStreamResponse > >( new WeakSet() );

	const queryParams = useMemo(
		() => getPaginatedStreamQueryParams( { streamKey, page, perPage, localeSlug } ),
		[ streamKey, page, perPage, localeSlug ]
	);

	const query = useQuery( {
		...readStreamQuery( streamKey, queryParams, { page, perPage, localeSlug } ),
		staleTime: 0,
	} );

	useEffect( () => {
		if ( ! query.data || processedPages.current.has( query.data ) ) {
			return;
		}
		processedPages.current.add( query.data );
		syncPaginatedStreamPage( queryClient, dispatch, query.data, streamKey );
	}, [ query.data, streamKey, queryClient, dispatch ] );

	const items = useMemo(
		() => getPaginatedStreamItems( queryClient, streamKey, perPage, localeSlug ),
		[ queryClient, streamKey, perPage, localeSlug, query.data ]
	);
	const pagination = useMemo(
		() => getPaginationFromResponse( query.data, perPage, items.length ),
		[ query.data, perPage, items.length ]
	);

	return {
		items,
		pagination,
		isRequesting: query.isLoading || query.isFetching,
		error: query.error,
	};
};
