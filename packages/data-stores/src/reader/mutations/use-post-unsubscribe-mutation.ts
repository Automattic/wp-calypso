import { deletePostCommentEmailSubscription } from '@automattic/api-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import { PostSubscription, SubscriptionManagerSubscriptionsCount } from '../types';

type UnsubscribeParams = {
	id: number | string;
	blog_id: number | string;
	post_id: number | string;
};

type PostSubscriptions = {
	comment_subscriptions: PostSubscription[];
	total_comment_subscriptions_count: number;
};

type PostSubscriptionsPages = {
	pageParams: [];
	pages: PostSubscriptions[];
};

const usePostUnsubscribeMutation = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();
	const postSubscriptionsCacheKey = useCacheKey( [ 'read', 'post-subscriptions' ] );
	const subscriptionsCountCacheKey = useCacheKey( [ 'read', 'subscriptions-count' ] );

	return useMutation( {
		mutationFn: async ( params: UnsubscribeParams ) => {
			return deletePostCommentEmailSubscription( {
				blog_id: params.blog_id,
				post_id: params.post_id,
			} );
		},
		onMutate: async ( params ) => {
			await queryClient.cancelQueries( { queryKey: postSubscriptionsCacheKey } );
			await queryClient.cancelQueries( {
				queryKey: [ 'read', 'subscriptions-count', isLoggedIn ],
			} );

			const previousPostSubscriptions =
				queryClient.getQueryData< PostSubscriptionsPages >( postSubscriptionsCacheKey );

			// remove post from comment subscriptions
			if ( previousPostSubscriptions ) {
				queryClient.setQueryData< PostSubscriptionsPages >( postSubscriptionsCacheKey, {
					...previousPostSubscriptions,
					pages: previousPostSubscriptions.pages.map( ( page ) => ( {
						...page,
						comment_subscriptions: page.comment_subscriptions.filter(
							( subscription ) => subscription.id !== params.id
						),
						total_comment_subscriptions_count: page.total_comment_subscriptions_count - 1,
					} ) ),
				} );
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
			if ( context?.previousPostSubscriptions ) {
				queryClient.setQueryData< PostSubscriptionsPages >(
					postSubscriptionsCacheKey,
					context.previousPostSubscriptions
				);
			}
			if ( context?.previousSubscriptionsCount ) {
				queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
					subscriptionsCountCacheKey,
					context.previousSubscriptionsCount
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries( { queryKey: postSubscriptionsCacheKey } );
			queryClient.invalidateQueries( { queryKey: subscriptionsCountCacheKey } );
		},
	} );
};

export default usePostUnsubscribeMutation;
