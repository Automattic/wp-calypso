import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import { postSubscriptionsQueryKeyPrefix } from '../queries/use-post-subscriptions-query';
import type { PostSubscriptionsResult } from '../types';

type PostSubscriptionNotifyMeOfNewCommentsParams = {
	subscriptionId: string;
	sendComments: boolean;
};

type PostSubscriptionNotifyMeOfNewCommentsResponse = {
	updated: boolean;
};

const usePostNotifyMeOfNewCommentsMutation = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();
	const postSubscriptionsCacheKey = useCacheKey( postSubscriptionsQueryKeyPrefix );

	return useMutation( {
		mutationFn: async ( params: PostSubscriptionNotifyMeOfNewCommentsParams ) => {
			if ( ! params.subscriptionId || typeof params.sendComments !== 'boolean' ) {
				throw new Error(
					'Something went wrong while changing the "Notify me of new comments" setting.'
				);
			}

			const response = await callApi< PostSubscriptionNotifyMeOfNewCommentsResponse >( {
				apiNamespace: 'wpcom/v2',
				path: `/post-comment-subscriptions/${ params.subscriptionId }/update`,
				method: 'POST',
				body: {
					send_comments: params.sendComments,
				},
				isLoggedIn,
				apiVersion: '2',
			} );
			if ( ! response.updated ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while changing the "Notify me of new posts" setting.'
				);
			}

			return response;
		},
		onMutate: async ( { subscriptionId, sendComments } ) => {
			const previousPostSubscriptions =
				queryClient.getQueryData< PostSubscriptionsResult >( postSubscriptionsCacheKey );

			if ( previousPostSubscriptions ) {
				queryClient.setQueryData( postSubscriptionsCacheKey, {
					...previousPostSubscriptions,
					pages: previousPostSubscriptions.pages.map( ( page ) => ( {
						...page,
						comment_subscriptions: page.comment_subscriptions.map( ( commentSubscription ) => {
							if ( commentSubscription.id === subscriptionId ) {
								return {
									...commentSubscription,
									notification: {
										send_comments: sendComments,
									},
								};
							}
							return commentSubscription;
						} ),
					} ) ),
				} );
			}
			return {
				previousPostSubscriptions,
			};
		},
		onError: ( err, _, context ) => {
			if ( context?.previousPostSubscriptions ) {
				queryClient.setQueryData(
					postSubscriptionsQueryKeyPrefix,
					context.previousPostSubscriptions
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries( { queryKey: postSubscriptionsQueryKeyPrefix } );
		},
	} );
};

export default usePostNotifyMeOfNewCommentsMutation;
