import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import { subscriptionsCountQueryKeyPrefix } from '../queries/use-subscriptions-count-query';
import { PendingPostSubscriptionsResult, SubscriptionManagerSubscriptionsCount } from '../types';

type PendingPostDeleteParams = {
	id: number | string;
};

type PendingPostDeleteResponse = {
	deleted: boolean;
};

const usePendingPostDeleteMutation = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();
	const countCacheKey = useCacheKey( subscriptionsCountQueryKeyPrefix );

	return useMutation( {
		mutationFn: async ( params: PendingPostDeleteParams ) => {
			if ( ! params.id ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'ID is missing.'
				);
			}

			const response = await callApi< PendingPostDeleteResponse >( {
				apiNamespace: 'wpcom/v2',
				path: `/post-comment-subscriptions/${ params.id }/delete`,
				method: 'POST',
				isLoggedIn,
				apiVersion: '2',
			} );
			if ( ! response.deleted ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while deleting pending subscription.'
				);
			}

			return response;
		},
		onMutate: async ( params ) => {
			await queryClient.cancelQueries( {
				queryKey: [ 'read', 'pending-post-subscriptions', isLoggedIn ],
			} );
			await queryClient.cancelQueries( { queryKey: countCacheKey } );

			const previousPendingPostSubscriptions =
				queryClient.getQueryData< PendingPostSubscriptionsResult >( [
					'read',
					'pending-post-subscriptions',
					isLoggedIn,
				] );

			// remove post comment from pending post subscriptions
			if ( previousPendingPostSubscriptions?.pendingPosts ) {
				queryClient.setQueryData< PendingPostSubscriptionsResult >(
					[ [ 'read', 'pending-post-subscriptions', isLoggedIn ] ],
					{
						pendingPosts: previousPendingPostSubscriptions.pendingPosts.filter(
							( pendingPostSubscription ) => pendingPostSubscription.id !== params.id
						),
						totalCount: previousPendingPostSubscriptions.totalCount - 1,
					}
				);
			}

			const previousSubscriptionsCount =
				queryClient.getQueryData< SubscriptionManagerSubscriptionsCount >( countCacheKey );

			// decrement the post comment count
			if ( previousSubscriptionsCount ) {
				queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >( countCacheKey, {
					...previousSubscriptionsCount,
					pending: previousSubscriptionsCount?.pending
						? previousSubscriptionsCount?.pending - 1
						: null,
				} );
			}

			return { previousPendingPostSubscriptions, previousSubscriptionsCount };
		},
		onError: ( error, variables, context ) => {
			if ( context?.previousPendingPostSubscriptions ) {
				queryClient.setQueryData< PendingPostSubscriptionsResult >(
					[ 'read', 'pending-post-subscriptions', isLoggedIn ],
					context.previousPendingPostSubscriptions
				);
			}
			if ( context?.previousSubscriptionsCount ) {
				queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
					countCacheKey,
					context.previousSubscriptionsCount
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries( {
				queryKey: [ 'read', 'pending-post-subscriptions', isLoggedIn ],
			} );
			queryClient.invalidateQueries( countCacheKey );
		},
	} );
};

export default usePendingPostDeleteMutation;
