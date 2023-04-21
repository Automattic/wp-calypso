import { useMutation, useQueryClient } from 'react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import { PendingPostSubscriptionsResult, SubscriptionManagerSubscriptionsCount } from '../types';

type PendingPostConfirmParams = {
	id: string;
};

type PendingPostConfirmResponse = {
	confirmed: boolean;
};

const usePendingPostConfirmMutation = () => {
	const isLoggedIn = useIsLoggedIn();
	const queryClient = useQueryClient();
	const countCacheKey = useCacheKey( [ 'read', 'subscriptions-count' ] );
	return useMutation(
		async ( { id }: PendingPostConfirmParams ) => {
			if ( ! id ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Invalid subscription key'
				);
			}

			const response = await callApi< PendingPostConfirmResponse >( {
				path: `/post-comment-subscriptions/${ id }/confirm`,
				method: 'POST',
				apiVersion: '2',
			} );
			if ( ! response.confirmed ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while confirming subscription.'
				);
			}

			return response;
		},
		{
			onMutate: async ( { id } ) => {
				await queryClient.cancelQueries( [ 'read', 'pending-post-subscriptions', isLoggedIn ] );
				await queryClient.cancelQueries( countCacheKey );

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
								( pendingPost ) => pendingPost.id !== id
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
						comments: previousSubscriptionsCount?.comments
							? previousSubscriptionsCount?.comments + 1
							: 1,
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
				queryClient.invalidateQueries( [ 'read', 'pending-post-subscriptions', isLoggedIn ] );
				queryClient.invalidateQueries( countCacheKey );
			},
		}
	);
};

export default usePendingPostConfirmMutation;
