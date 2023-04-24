import { useMutation, useQueryClient } from 'react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import { PostSubscription, SubscriptionManagerSubscriptionsCount } from '../types';

type PostSubscriptionUnfollowParams = {
	id: number | string;
	blog_id: number | string;
	post_id: number | string;
};

type PostSubscriptionUnfollowResponse = {
	success: boolean;
	subscribed: boolean;
	subscription: null;
};

type SubscriptionManagerPostSubscriptions = {
	comment_subscriptions: PostSubscription[];
	total_comment_subscriptions_count: number;
};

type SubscriptionManagerPostSubscriptionsPages = {
	pageParams: [];
	pages: SubscriptionManagerPostSubscriptions[];
};

const usePostUnfollowMutation = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();
	const postSubscriptionsCacheKey = useCacheKey( [ 'read', 'post-subscriptions' ] );
	const subscriptionsCountCacheKey = useCacheKey( [ 'read', 'subscriptions-count' ] );

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
				await queryClient.cancelQueries( postSubscriptionsCacheKey );
				await queryClient.cancelQueries( [ 'read', 'subscriptions-count', isLoggedIn ] );

				const previousPostSubscriptions =
					queryClient.getQueryData< SubscriptionManagerPostSubscriptionsPages >(
						postSubscriptionsCacheKey
					);

				// remove post from comment subscriptions
				if ( previousPostSubscriptions ) {
					previousPostSubscriptions.pages = previousPostSubscriptions.pages.map( ( page ) => ( {
						...page,
						comment_subscriptions: page.comment_subscriptions.filter(
							( subscription ) => subscription.id !== params.id
						),
					} ) );

					queryClient.setQueryData< SubscriptionManagerPostSubscriptionsPages >(
						postSubscriptionsCacheKey,
						previousPostSubscriptions
					);
				}

				const previousSubscriptionsCount =
					queryClient.getQueryData< SubscriptionManagerSubscriptionsCount >(
						subscriptionsCountCacheKey
					);

				// decrement the comments count
				if ( previousSubscriptionsCount ) {
					queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
						subscriptionsCountCacheKey,
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
				// if ( context?.previousPostSubscriptions ) {
				// 	queryClient.setQueryData< PostSubscription[] >(
				// 		postSubscriptionsCacheKey,
				// 		context.previousPostSubscriptions
				// 	);
				// }
				if ( context?.previousSubscriptionsCount ) {
					queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
						[ 'read', 'subscriptions-count', isLoggedIn ],
						context.previousSubscriptionsCount
					);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries( postSubscriptionsCacheKey );
				queryClient.invalidateQueries( subscriptionsCountCacheKey );
			},
		}
	);
};

export default usePostUnfollowMutation;
