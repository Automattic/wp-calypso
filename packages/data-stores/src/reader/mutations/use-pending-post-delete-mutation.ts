import { useMutation, useQueryClient } from 'react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import { PendingPostSubscription, SubscriptionManagerSubscriptionsCount } from '../types';

type PendingPostDeleteParams = {
	id: number | string;
};

type PendingPostDeleteResponse = {
	deleted: boolean;
};

const usePendingPostDeleteMutation = () => {
	const isLoggedIn = useIsLoggedIn();
	const queryClient = useQueryClient();
	const countCacheKey = useCacheKey( [ 'read', 'subscriptions-count' ] );
	return useMutation(
		async ( params: PendingPostDeleteParams ) => {
			if ( ! params.id ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'ID is missing.'
				);
			}

			const response = await callApi< PendingPostDeleteResponse >( {
				path: `/post-comment-subscriptions/${ params.id }/delete`,
				method: 'POST',
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
		{
			onMutate: async ( params ) => {
				await queryClient.cancelQueries( [ 'read', 'pending-post-subscriptions', isLoggedIn ] );
				await queryClient.cancelQueries( countCacheKey );

				const previousPendingPostSubscriptions = queryClient.getQueryData<
					PendingPostSubscription[]
				>( [ 'read', 'pending-post-subscriptions', isLoggedIn ] );

				// remove post comment from pending post subscriptions
				if ( previousPendingPostSubscriptions ) {
					queryClient.setQueryData< PendingPostSubscription[] >(
						[ [ 'read', 'pending-post-subscriptions', isLoggedIn ] ],
						previousPendingPostSubscriptions.filter(
							( pendingPostSubscription ) => pendingPostSubscription.id !== params.id
						)
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
					queryClient.setQueryData< PendingPostSubscription[] >(
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

export default usePendingPostDeleteMutation;
