import { useMutation, useQueryClient } from 'react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import { PendingSiteSubscriptionsResult, SubscriptionManagerSubscriptionsCount } from '../types';

type PendingSiteConfirmParams = {
	id: string;
	activation_key: string;
};

type PendingSiteConfirmResponse = {
	confirmed: boolean;
};

const usePendingSiteConfirmMutation = () => {
	const isLoggedIn = useIsLoggedIn();
	const queryClient = useQueryClient();
	const countCacheKey = useCacheKey( [ 'read', 'subscriptions-count' ] );
	return useMutation(
		async ( params: PendingSiteConfirmParams ) => {
			if ( ! params.activation_key ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Invalid activation key.'
				);
			}

			const response = await callApi< PendingSiteConfirmResponse >( {
				path: `/pending-blog-subscriptions/${ params.activation_key }/confirm`,
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
			onMutate: async ( params ) => {
				await queryClient.cancelQueries( [ 'read', 'pending-site-subscriptions', isLoggedIn ] );
				await queryClient.cancelQueries( countCacheKey );

				const previousPendingSiteSubscriptions =
					queryClient.getQueryData< PendingSiteSubscriptionsResult >( [
						'read',
						'pending-site-subscriptions',
						isLoggedIn,
					] );

				// remove blog from pending site subscriptions
				if ( previousPendingSiteSubscriptions?.pendingSites ) {
					queryClient.setQueryData< PendingSiteSubscriptionsResult >(
						[ [ 'read', 'pending-site-subscriptions', isLoggedIn ] ],
						{
							pendingSites: previousPendingSiteSubscriptions.pendingSites.filter(
								( pendingSiteSubscription ) => pendingSiteSubscription.id !== params.id
							),
							totalCount: previousPendingSiteSubscriptions.totalCount - 1,
						}
					);
				}

				const previousSubscriptionsCount =
					queryClient.getQueryData< SubscriptionManagerSubscriptionsCount >( countCacheKey );

				// decrement the blog count
				if ( previousSubscriptionsCount ) {
					queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >( countCacheKey, {
						...previousSubscriptionsCount,
						blogs: previousSubscriptionsCount?.blogs ? previousSubscriptionsCount?.blogs + 1 : 1,
						pending: previousSubscriptionsCount?.pending
							? previousSubscriptionsCount?.pending - 1
							: null,
					} );
				}

				return { previousPendingSiteSubscriptions, previousSubscriptionsCount };
			},
			onError: ( error, variables, context ) => {
				if ( context?.previousPendingSiteSubscriptions ) {
					queryClient.setQueryData< PendingSiteSubscriptionsResult >(
						[ 'read', 'pending-site-subscriptions', isLoggedIn ],
						context.previousPendingSiteSubscriptions
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
				queryClient.invalidateQueries( [ 'read', 'pending-site-subscriptions', isLoggedIn ] );
				queryClient.invalidateQueries( countCacheKey );
			},
		}
	);
};

export default usePendingSiteConfirmMutation;
