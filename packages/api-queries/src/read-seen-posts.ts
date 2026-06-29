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
import { getSiteSubscriptionsQueryKey } from './read-follows';

export const markReaderPostsAsSeenMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSeenPostsResponse, Error, ReadSeenPostsFeedParams >( {
		mutationFn: markReaderPostsAsSeen,
		onSuccess: () => invalidateSiteSubscriptions( queryClient ),
	} );

export const markReaderPostsAsUnseenMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSeenPostsResponse, Error, ReadSeenPostsFeedParams >( {
		mutationFn: markReaderPostsAsUnseen,
		onSuccess: () => invalidateSiteSubscriptions( queryClient ),
	} );

export const markReaderWpcomPostsAsSeenMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSeenPostsResponse, Error, ReadSeenPostsBlogParams >( {
		mutationFn: markReaderWpcomPostsAsSeen,
		onSuccess: () => invalidateSiteSubscriptions( queryClient ),
	} );

export const markReaderWpcomPostsAsUnseenMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSeenPostsResponse, Error, ReadSeenPostsBlogParams >( {
		mutationFn: markReaderWpcomPostsAsUnseen,
		onSuccess: () => invalidateSiteSubscriptions( queryClient ),
	} );

export const markAllReaderPostsAsSeenMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSeenPostsResponse, Error, ReadSeenPostsAllParams >( {
		mutationFn: markAllReaderPostsAsSeen,
		onSuccess: () => invalidateSiteSubscriptions( queryClient ),
	} );

function invalidateSiteSubscriptions( queryClient: QueryClient ): void {
	queryClient.invalidateQueries( { queryKey: getSiteSubscriptionsQueryKey() } );
}
