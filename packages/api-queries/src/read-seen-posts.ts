import {
	markAllReaderPostsAsSeen,
	markReaderPostsAsSeen,
	markReaderPostsAsUnseen,
	markReaderWpcomPostsAsSeen,
	markReaderWpcomPostsAsUnseen,
	type ReadSeenPostsAllParams,
	type ReadSeenPostsBlogParams,
	type ReadSeenPostsFeedParams,
	type ReadSeenPostsResponse,
} from '@automattic/api-core';
import { mutationOptions, type QueryClient } from '@tanstack/react-query';
import { patchSubscriptionSeenCount } from './read-follows';
import { patchListsSeenCount } from './read-lists';

export const markReaderPostsAsSeenMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSeenPostsResponse, Error, ReadSeenPostsFeedParams >( {
		meta: { statId: 'read-posts-seen-mark' },
		mutationFn: markReaderPostsAsSeen,
		onSuccess: ( _response, params ) => {
			const update = ( current: number ) => current - params.feedItemIds.length;
			patchSubscriptionSeenCount( queryClient, { feedIds: [ params.feedId ] }, update );
			patchListsSeenCount( queryClient, [ params.feedId ], update );
		},
	} );

export const markReaderPostsAsUnseenMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSeenPostsResponse, Error, ReadSeenPostsFeedParams >( {
		meta: { statId: 'read-posts-unseen-mark' },
		mutationFn: markReaderPostsAsUnseen,
		onSuccess: ( _response, params ) => {
			const update = ( current: number ) => current + params.feedItemIds.length;
			patchSubscriptionSeenCount( queryClient, { feedIds: [ params.feedId ] }, update );
			patchListsSeenCount( queryClient, [ params.feedId ], update );
		},
	} );

export const markReaderWpcomPostsAsSeenMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSeenPostsResponse, Error, ReadSeenPostsBlogParams >( {
		meta: { statId: 'read-wpcom-seen-mark' },
		mutationFn: markReaderWpcomPostsAsSeen,
		onSuccess: ( _response, params ) => {
			patchSubscriptionSeenCount(
				queryClient,
				{ blogId: params.blogId },
				( current ) => current - params.postIds.length
			);
		},
	} );

export const markReaderWpcomPostsAsUnseenMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSeenPostsResponse, Error, ReadSeenPostsBlogParams >( {
		meta: { statId: 'read-wpcom-unseen-mark' },
		mutationFn: markReaderWpcomPostsAsUnseen,
		onSuccess: ( _response, params ) => {
			patchSubscriptionSeenCount(
				queryClient,
				{ blogId: params.blogId },
				( current ) => current + params.postIds.length
			);
		},
	} );

export const markAllReaderPostsAsSeenMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSeenPostsResponse, Error, ReadSeenPostsAllParams >( {
		meta: { statId: 'read-posts-all-seen-mark' },
		mutationFn: markAllReaderPostsAsSeen,
		onSuccess: ( _response, params ) => {
			patchSubscriptionSeenCount( queryClient, { feedIds: params.feedIds }, () => 0 );
			patchListsSeenCount( queryClient, params.feedIds, () => 0 );
		},
	} );
