import {
	updateSiteCommentEmailSubscription,
	deletePostCommentEmailSubscription,
	type UpdateSiteCommentEmailSubscriptionParams,
	type DeletePostCommentEmailSubscriptionParams,
} from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const siteEmailMeNewCommentsMutation = () =>
	mutationOptions( {
		mutationFn: ( params: UpdateSiteCommentEmailSubscriptionParams & { subscriptionId: number } ) =>
			updateSiteCommentEmailSubscription( params ),
		onSettled: () => {
			queryClient.invalidateQueries( { queryKey: [ 'read', 'site-subscriptions' ] } );
			queryClient.invalidateQueries( { queryKey: [ 'read', 'site-subscription-details' ] } );
			queryClient.invalidateQueries( { queryKey: [ 'read', 'subscriptions' ] } );
		},
	} );

export const postCommentEmailUnsubscribeMutation = () =>
	mutationOptions( {
		mutationFn: ( params: DeletePostCommentEmailSubscriptionParams ) =>
			deletePostCommentEmailSubscription( params ),
		onSettled: () => {
			queryClient.invalidateQueries( { queryKey: [ 'read', 'post-subscriptions' ] } );
			queryClient.invalidateQueries( { queryKey: [ 'read', 'subscriptions-count' ] } );
		},
	} );
