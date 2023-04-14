import { useMutation, useQueryClient } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import { PendingSiteSubscription, SubscriptionManagerSubscriptionsCount } from '../types';

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
	return useMutation(
		async ( params: PendingSiteConfirmParams ) => {
			if ( ! params.activation_key ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Invalid activation key.'
				);
			}

			const response = await callApi< PendingSiteConfirmResponse >( {
				path: `/pending-blog-subscriptions/${ params.activation_key }`,
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

export default usePendingSiteConfirmMutation;
