/**
 * Consumer hooks that wrap the seen-posts mutation factories in
 * `@automattic/api-queries` with Calypso-specific concerns:
 *
 *   - Post-cache `is_seen` patches via `updateCachedPostsMatching` so the
 *     full-post view, stream cards, and other Reader surfaces reflect the
 *     new state once the server confirms it.
 *   - Re-request of the unseen-status Redux slice via `requestUnseenStatus()`.
 */
import {
	getSiteSubscriptionsQueryKey,
	markAllReaderPostsAsSeenMutation,
	markReaderPostsAsSeenMutation,
	markReaderPostsAsUnseenMutation,
	markReaderWpcomPostsAsSeenMutation,
	markReaderWpcomPostsAsUnseenMutation,
} from '@automattic/api-queries';
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { getCachedPost, updateCachedPostsMatching } from 'calypso/reader/data/post/cache';
import { getCachedStreamItems } from 'calypso/reader/data/stream';
import { requestUnseenStatus } from 'calypso/state/reader-ui/seen-posts/actions';

const SOURCE_READER_WEB = 'reader-web';

export interface UseMarkAsSeenParams {
	feedId: number;
	feedItemIds: number[];
	globalIds?: string[];
}

export const useMarkAsSeenMutation = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const baseMutation = markReaderPostsAsSeenMutation( queryClient );

	return useMutation< unknown, Error, UseMarkAsSeenParams >( {
		mutationFn: ( params ) =>
			baseMutation.mutationFn!( {
				feedId: params.feedId,
				feedItemIds: params.feedItemIds,
				source: SOURCE_READER_WEB,
			} ),
		onSuccess: ( _response, params ) => {
			patchPostsSeenByGlobalId( queryClient, params.globalIds ?? [], true );
			dispatch( requestUnseenStatus() );
			return queryClient.invalidateQueries( { queryKey: getSiteSubscriptionsQueryKey() } );
		},
	} );
};

export const useMarkAsUnseenMutation = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const baseMutation = markReaderPostsAsUnseenMutation( queryClient );

	return useMutation< unknown, Error, UseMarkAsSeenParams >( {
		mutationFn: ( params ) =>
			baseMutation.mutationFn!( {
				feedId: params.feedId,
				feedItemIds: params.feedItemIds,
				source: SOURCE_READER_WEB,
			} ),
		onSuccess: ( _response, params ) => {
			patchPostsSeenByGlobalId( queryClient, params.globalIds ?? [], false );
			dispatch( requestUnseenStatus() );
			return queryClient.invalidateQueries( { queryKey: getSiteSubscriptionsQueryKey() } );
		},
	} );
};

export interface UseMarkAsSeenBlogParams {
	blogId: number;
	postIds: number[];
	globalIds?: string[];
}

export const useMarkAsSeenBlogMutation = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const baseMutation = markReaderWpcomPostsAsSeenMutation( queryClient );

	return useMutation< unknown, Error, UseMarkAsSeenBlogParams >( {
		mutationFn: ( params ) =>
			baseMutation.mutationFn!( {
				blogId: params.blogId,
				postIds: params.postIds,
				source: SOURCE_READER_WEB,
			} ),
		onSuccess: ( _response, params ) => {
			patchPostsSeenByGlobalId( queryClient, params.globalIds ?? [], true );
			dispatch( requestUnseenStatus() );
			return queryClient.invalidateQueries( { queryKey: getSiteSubscriptionsQueryKey() } );
		},
	} );
};

export const useMarkAsUnseenBlogMutation = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const baseMutation = markReaderWpcomPostsAsUnseenMutation( queryClient );

	return useMutation< unknown, Error, UseMarkAsSeenBlogParams >( {
		mutationFn: ( params ) =>
			baseMutation.mutationFn!( {
				blogId: params.blogId,
				postIds: params.postIds,
				source: SOURCE_READER_WEB,
			} ),
		onSuccess: ( _response, params ) => {
			patchPostsSeenByGlobalId( queryClient, params.globalIds ?? [], false );
			dispatch( requestUnseenStatus() );
			return queryClient.invalidateQueries( { queryKey: getSiteSubscriptionsQueryKey() } );
		},
	} );
};

export interface UseMarkAllAsSeenParams {
	/** The Calypso stream key for the section we're operating on (e.g. 'p2', 'a8c'). */
	identifier: string;
	feedIds: number[];
	feedUrls: string[];
}

export const useMarkAllAsSeenMutation = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const baseMutation = markAllReaderPostsAsSeenMutation( queryClient );

	return useMutation< unknown, Error, UseMarkAllAsSeenParams >( {
		mutationFn: ( params ) =>
			baseMutation.mutationFn!( { feedIds: params.feedIds, source: SOURCE_READER_WEB } ),
		onSuccess: ( _response, params ) => {
			const globalIds = getCachedStreamItems( queryClient, { streamKey: params.identifier } )
				.map( ( item ) => getCachedPost( queryClient, item )?.global_ID )
				.filter( ( id ): id is string => typeof id === 'string' );

			patchPostsSeenByFeed( queryClient, {
				globalIds,
				feedIds: params.feedIds,
				feedUrls: params.feedUrls,
			} );

			dispatch( requestUnseenStatus() );
			return queryClient.invalidateQueries( { queryKey: getSiteSubscriptionsQueryKey() } );
		},
	} );
};

function patchPostsSeenByGlobalId(
	queryClient: QueryClient,
	globalIds: Array< string | undefined >,
	isSeen: boolean
) {
	const ids = new Set( globalIds.filter( ( id ): id is string => typeof id === 'string' ) );
	if ( ids.size === 0 ) {
		return;
	}
	updateCachedPostsMatching(
		queryClient,
		( post ) => typeof post.global_ID === 'string' && ids.has( post.global_ID ),
		() => ( { is_seen: isSeen } )
	);
}

function patchPostsSeenByFeed(
	queryClient: QueryClient,
	{
		globalIds,
		feedIds,
		feedUrls,
	}: {
		globalIds: Array< string | undefined >;
		feedIds: number[];
		feedUrls: string[];
	}
) {
	const idSet = new Set( globalIds.filter( ( id ): id is string => typeof id === 'string' ) );
	const feedIdSet = new Set( feedIds.map( String ) );
	const feedUrlSet = new Set( feedUrls );

	updateCachedPostsMatching(
		queryClient,
		( post ) => {
			if ( typeof post.global_ID === 'string' && idSet.has( post.global_ID ) ) {
				return true;
			}
			if ( post.feed_ID != null && feedIdSet.has( String( post.feed_ID ) ) ) {
				return true;
			}
			if ( typeof post.feed_URL === 'string' && feedUrlSet.has( post.feed_URL ) ) {
				return true;
			}
			return false;
		},
		() => ( { is_seen: true } )
	);
}
