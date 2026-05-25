import {
	getStreamType,
	readStreamInfiniteQuery,
	type PageHandle,
	type ReadStreamInfiniteQueryHelpers,
} from '@automattic/api-queries';
import {
	useInfiniteQuery,
	useQueryClient,
	type InfiniteData,
	type QueryClient,
} from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { syncConversationFollowStatus, syncPostCache } from 'calypso/reader/data/post/cache';
import { useDispatch } from 'calypso/state';
import { buildStreamQueryParams } from '../../build-query-params';
import { extractPageHandle, normalizeStreamPage } from '../../normalization';
import { combineXPosts } from '../../utils';
import type { StreamItem } from '../../types';
import type { ReadStreamQueryParams, ReadStreamResponse } from '@automattic/api-core';
import type { Dispatch } from 'redux';

export interface UseInfiniteStreamResult {
	items: StreamItem[];
	pages: ReadStreamResponse[];
	isLoading: boolean;
	isFetching: boolean;
	isFetchingNextPage: boolean;
	isRefetching: boolean;
	hasNextPage: boolean;
	lastPage: boolean;
	error: unknown;
	fetchNextPage: () => void;
	refetch: () => void;
	invalidate: () => void;
}

interface UseInfiniteStreamOptions {
	streamKey?: string | null;
	feedId?: number | null;
	localeSlug?: string | null;
	startDate?: string | null;
	options?: {
		enabled?: boolean;
	};
}

interface InfiniteStreamQueryOptions {
	streamKey: string;
	feedId?: number | null;
	localeSlug?: string | null;
	startDate?: string | null;
	enabled?: boolean;
}

const getInfiniteStreamQueryOptions = ( {
	streamKey,
	feedId = null,
	localeSlug = null,
	startDate = null,
	enabled = true,
}: InfiniteStreamQueryOptions ) => {
	const streamType = streamKey ? getStreamType( streamKey ) : '';
	const buildPageParams: ReadStreamInfiniteQueryHelpers[ 'buildPageParams' ] = (
		pageHandle: PageHandle
	) =>
		buildStreamQueryParams( {
			streamKey,
			feedId,
			pageHandle,
			localeSlug,
			isPoll: false,
			gap: null,
			page: undefined,
			perPage: undefined,
		} ) as ReadStreamQueryParams;
	const getNextPageHandle: ReadStreamInfiniteQueryHelpers[ 'getNextPageHandle' ] = (
		lastPage,
		lastPageParam
	) => {
		const { streamItems } = normalizeStreamPage( lastPage, streamType );
		if ( streamItems.length === 0 ) {
			return undefined;
		}
		const action = {
			payload: {
				pageHandle: ( lastPageParam ?? undefined ) as { offset?: number } | undefined,
			},
		};
		return extractPageHandle( streamType, action, lastPage ) ?? undefined;
	};

	return readStreamInfiniteQuery(
		{ streamKey, feedId, localeSlug, startDate, enabled },
		{ buildPageParams, getNextPageHandle }
	);
};

const syncStreamPage = (
	queryClient: QueryClient,
	dispatch: Dispatch,
	page: ReadStreamResponse,
	streamKey: string
) => {
	const { streamPosts } = normalizeStreamPage( page, getStreamType( streamKey ) );
	if ( streamPosts.length > 0 ) {
		syncPostCache( queryClient, streamPosts );
		syncConversationFollowStatus( dispatch, streamPosts );
	}
};

export const prefetchInfiniteStream = async (
	queryClient: QueryClient,
	dispatch: Dispatch,
	options: InfiniteStreamQueryOptions
) => {
	const queryOptions = getInfiniteStreamQueryOptions( { ...options, enabled: true } );
	await queryClient.prefetchInfiniteQuery( queryOptions );
	const data = queryClient.getQueryData< InfiniteData< ReadStreamResponse, PageHandle > >(
		queryOptions.queryKey
	);
	for ( const page of data?.pages ?? [] ) {
		syncStreamPage( queryClient, dispatch, page, options.streamKey );
	}
};

export const useInfiniteStream = ( {
	streamKey,
	feedId = null,
	localeSlug = null,
	startDate = null,
	options,
}: UseInfiniteStreamOptions ): UseInfiniteStreamResult => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const resolvedStreamKey = streamKey ?? '';
	const streamType = resolvedStreamKey ? getStreamType( resolvedStreamKey ) : '';
	const enabled = ( options?.enabled ?? true ) && !! streamKey;

	const queryOptions = useMemo(
		() =>
			getInfiniteStreamQueryOptions( {
				streamKey: resolvedStreamKey,
				feedId,
				localeSlug,
				startDate,
				enabled,
			} ),
		[ resolvedStreamKey, feedId, localeSlug, startDate, enabled ]
	);

	const query = useInfiniteQuery( queryOptions );
	const processedPages = useRef< WeakSet< ReadStreamResponse > >( new WeakSet() );

	useEffect( () => {
		const pages = query.data?.pages;
		if ( ! pages ) {
			return;
		}
		for ( let i = 0; i < pages.length; i++ ) {
			const page = pages[ i ] as ReadStreamResponse;
			if ( processedPages.current.has( page ) ) {
				continue;
			}
			processedPages.current.add( page );
			syncStreamPage( queryClient, dispatch, page, resolvedStreamKey );
		}
	}, [ resolvedStreamKey, streamType, query.data, queryClient, dispatch ] );

	const items: StreamItem[] = useMemo( () => {
		const pages = query.data?.pages ?? [];
		const collected: StreamItem[] = [];
		for ( const page of pages ) {
			const { streamItems } = normalizeStreamPage( page as ReadStreamResponse, streamType );
			for ( const item of streamItems ) {
				collected.push( item );
			}
		}
		return combineXPosts( collected ) as StreamItem[];
	}, [ query.data, streamType ] );

	const queryKey = queryOptions.queryKey;
	const invalidate = useCallback( () => {
		queryClient.invalidateQueries( { queryKey, refetchType: 'none' } );
	}, [ queryClient, queryKey ] );

	return {
		items,
		pages: ( query.data?.pages ?? [] ) as ReadStreamResponse[],
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		isFetchingNextPage: query.isFetchingNextPage,
		isRefetching: query.isRefetching,
		hasNextPage: !! query.hasNextPage,
		lastPage: ! query.hasNextPage && ! query.isFetchingNextPage && query.isFetched,
		error: query.error,
		fetchNextPage: query.fetchNextPage,
		refetch: query.refetch,
		invalidate,
	};
};
