import { useMutation, useQueryClient } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import { PostSubscription, SubscriptionManagerSubscriptionsCount } from '../types';

type PostSubscriptionUnfollowParams = {
	blog_id: number | string;
	post_id: number | string;
};

type PostSubscriptionUnfollowResponse = {
	success: boolean;
	subscribed: boolean;
	subscription: null;
};

const usePostUnfollowMutation = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();
	return useMutation(
		async ( params: PostSubscriptionUnfollowParams ) => {
			if ( ! params.blog_id ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while unsubscribing.'
				);
			}

			const response = await callApi< PostSubscriptionUnfollowResponse >( {
				path: `/read/site/${ params.blog_id }/comment_email_subscriptions/delete?post_id=${ params.post_id }`,
				method: 'POST',
				isLoggedIn,
				apiVersion: '1.2',
			} );

			if ( ! response.success ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while unsubscribing.'
				);
			}

			return response;
		},
		{
			onMutate: async ( params ) => {
				await queryClient.cancelQueries( [ 'read', 'post-subscriptions', isLoggedIn ] );
				await queryClient.cancelQueries( [ 'read', 'subscriptions-count', isLoggedIn ] );

				const previousPostSubscriptions = queryClient.getQueryData< PostSubscription[] >( [
					'read',
					'post-subscriptions',
					isLoggedIn,
				] );

				// remove post from comment subscriptions
				if ( previousPostSubscriptions ) {
					queryClient.setQueryData< PostSubscription[] >(
						[ [ 'read', 'post-subscriptions', isLoggedIn ] ],
						previousPostSubscriptions.filter(
							( postSubscription ) => postSubscription.id !== params.post_id
						)
					);
				}

				const previousSubscriptionsCount =
					queryClient.getQueryData< SubscriptionManagerSubscriptionsCount >( [
						'read',
						'subscriptions-count',
						isLoggedIn,
					] );

				// decrement the comments count
				if ( previousSubscriptionsCount ) {
					queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
						[ 'read', 'subscriptions-count', isLoggedIn ],
						{
							...previousSubscriptionsCount,
							comments: previousSubscriptionsCount?.comments
								? previousSubscriptionsCount?.comments - 1
								: null,
						}
					);
				}

				return { previousPostSubscriptions, previousSubscriptionsCount };
			},
			onError: ( error, variables, context ) => {
				if ( context?.previousPostSubscriptions ) {
					queryClient.setQueryData< PostSubscription[] >(
						[ 'read', 'post-subscriptions', isLoggedIn ],
						context.previousPostSubscriptions
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
				queryClient.invalidateQueries( [ 'read', 'post-subscriptions', isLoggedIn ] );
				queryClient.invalidateQueries( [ 'read', 'subscriptions-count', isLoggedIn ] );
			},
		}
	);
};

export default usePostUnfollowMutation;
