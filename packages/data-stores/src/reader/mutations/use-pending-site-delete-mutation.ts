import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import { subscriptionsCountQueryKeyPrefix } from '../queries/use-subscriptions-count-query';
import { PendingSiteSubscriptionsResult, SubscriptionManagerSubscriptionsCount } from '../types';

type PendingSiteDeleteParams = {
	id: number | string;
};

type PendingSiteDeleteResponse = {
	deleted: boolean;
};

const usePendingSiteDeleteMutation = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();
	const countCacheKey = useCacheKey( subscriptionsCountQueryKeyPrefix );

	return useMutation( {
		mutationFn: async ( params: PendingSiteDeleteParams ) => {
			if ( ! params.id ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'ID is missing.'
				);
			}

			const response = await callApi< PendingSiteDeleteResponse >( {
				apiNamespace: 'wpcom/v2',
				path: `/pending-blog-subscriptions/${ params.id }/delete`,
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
				queryKey: [ 'read', 'pending-site-subscriptions', isLoggedIn ],
			} );
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
			queryClient.invalidateQueries( { queryKey: countCacheKey } );
		},
	} );
};

export default usePendingSiteDeleteMutation;
