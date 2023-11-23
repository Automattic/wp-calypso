import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import { siteSubscriptionsQueryKeyPrefix } from '../queries';
import { subscriptionsCountQueryKeyPrefix } from '../queries/use-subscriptions-count-query';
import { PendingSiteSubscriptionsResult, SubscriptionManagerSubscriptionsCount } from '../types';

type PendingSiteConfirmParams = {
	id: string;
	activation_key: string;
};

type PendingSiteConfirmResponse = {
	confirmed: boolean;
};

const usePendingSiteConfirmMutation = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();
	const subscriptionsCacheKey = useCacheKey( siteSubscriptionsQueryKeyPrefix );
	const countCacheKey = useCacheKey( subscriptionsCountQueryKeyPrefix );

	return useMutation( {
		mutationFn: async ( params: PendingSiteConfirmParams ) => {
			if ( ! params.activation_key ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Invalid activation key.'
				);
			}

			const response = await callApi< PendingSiteConfirmResponse >( {
				apiNamespace: 'wpcom/v2',
				path: `/pending-blog-subscriptions/${ params.activation_key }/confirm`,
				method: 'POST',
				isLoggedIn,
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
		onMutate: async ( params ) => {
			await queryClient.cancelQueries( {
				queryKey: [ 'read', 'pending-site-subscriptions', isLoggedIn ],
			} );
			await queryClient.cancelQueries( { queryKey: subscriptionsCacheKey } );
			await queryClient.cancelQueries( { queryKey: countCacheKey } );

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
			queryClient.invalidateQueries( {
				queryKey: [ 'read', 'pending-site-subscriptions', isLoggedIn ],
			} );
			queryClient.invalidateQueries( { queryKey: subscriptionsCacheKey } );
			queryClient.invalidateQueries( { queryKey: countCacheKey } );
		},
	} );
};

export default usePendingSiteConfirmMutation;
