import { useMutation, useQueryClient } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import { PendingSiteSubscription, SubscriptionManagerSubscriptionsCount } from '../types';

type PendingSiteDeleteParams = {
	id: number | string;
};

type PendingSiteDeleteResponse = {
	deleted: boolean;
};

const usePendingSiteDeleteMutation = () => {
	const isLoggedIn = useIsLoggedIn();
	const queryClient = useQueryClient();
	return useMutation(
		async ( params: PendingSiteDeleteParams ) => {
			if ( ! params.id ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'ID is missing.'
				);
			}

			const response = await callApi< PendingSiteDeleteResponse >( {
				path: `/pending-blog-subscriptions/${ params.id }/delete`,
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
				await queryClient.cancelQueries( [ 'read', 'pending-site-subscriptions', isLoggedIn ] );
				await queryClient.cancelQueries( [ 'read', 'subscriptions-count', isLoggedIn ] );

				const previousPendingSiteSubscriptions = queryClient.getQueryData<
					PendingSiteSubscription[]
				>( [ 'read', 'pending-site-subscriptions', isLoggedIn ] );

				// remove blog from pending site subscriptions
				if ( previousPendingSiteSubscriptions ) {
					queryClient.setQueryData< PendingSiteSubscription[] >(
						[ [ 'read', 'pending-site-subscriptions', isLoggedIn ] ],
						previousPendingSiteSubscriptions.filter(
							( pendingSiteSubscription ) => pendingSiteSubscription.id !== params.id
						)
					);
				}

				const previousSubscriptionsCount =
					queryClient.getQueryData< SubscriptionManagerSubscriptionsCount >( [
						'read',
						'subscriptions-count',
						isLoggedIn,
					] );

				// decrement the blog count
				if ( previousSubscriptionsCount ) {
					queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
						[ 'read', 'subscriptions-count', isLoggedIn ],
						{
							...previousSubscriptionsCount,
							blogs: previousSubscriptionsCount?.pending
								? previousSubscriptionsCount?.pending - 1
								: null,
						}
					);
				}

				return { previousPendingSiteSubscriptions, previousSubscriptionsCount };
			},
			onError: ( error, variables, context ) => {
				if ( context?.previousPendingSiteSubscriptions ) {
					queryClient.setQueryData< PendingSiteSubscription[] >(
						[ 'read', 'pending-site-subscriptions', isLoggedIn ],
						context.previousPendingSiteSubscriptions
					);
				}
				if ( context?.previousSubscriptionsCount ) {
					queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
						[ 'read', 'subscriptions-count', isLoggedIn ],
						context.previousSubscriptionsCount
					);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries( [ 'read', 'pending-site-subscriptions', isLoggedIn ] );
				queryClient.invalidateQueries( [ 'read', 'subscriptions-count', isLoggedIn ] );
			},
		}
	);
};

export default usePendingSiteDeleteMutation;
