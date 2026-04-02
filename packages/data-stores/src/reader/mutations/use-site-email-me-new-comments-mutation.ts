import { updateSiteCommentEmailSubscription } from '@automattic/api-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildQueryKey } from '../helpers';
import {
	alterSiteSubscriptionDetails,
	invalidateSiteSubscriptionDetails,
} from '../helpers/optimistic-update';
import { useIsLoggedIn } from '../hooks';
import type { SiteSubscriptionsPages, SiteSubscriptionDetails } from '../types';

type SiteSubscriptionEmailMeNewCommentsParams = {
	send_comments: boolean;
	blog_id: number | string;
	subscriptionId: number;
};

const useSiteEmailMeNewCommentsMutation = () => {
	const { id, isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: async ( params: SiteSubscriptionEmailMeNewCommentsParams ) => {
			return updateSiteCommentEmailSubscription( {
				send_comments: params.send_comments,
				blog_id: params.blog_id,
			} );
		},
		onMutate: async ( { blog_id, send_comments, subscriptionId } ) => {
			const siteSubscriptionsQueryKey = buildQueryKey(
				[ 'read', 'site-subscriptions' ],
				isLoggedIn,
				id
			);

			await queryClient.cancelQueries( { queryKey: siteSubscriptionsQueryKey } );

			const previousSiteSubscriptions =
				queryClient.getQueryData< SiteSubscriptionsPages >( siteSubscriptionsQueryKey );

			if ( previousSiteSubscriptions ) {
				queryClient.setQueryData( siteSubscriptionsQueryKey, {
					...previousSiteSubscriptions,
					pages: previousSiteSubscriptions.pages.map( ( page ) => {
						return {
							...page,
							subscriptions: page.subscriptions.map( ( siteSubscription ) => {
								if ( siteSubscription.blog_ID === blog_id ) {
									return {
										...siteSubscription,
										delivery_methods: {
											...siteSubscription.delivery_methods,
											email: {
												...siteSubscription.delivery_methods?.email,
												send_comments: send_comments,
											},
										},
									};
								}
								return siteSubscription;
							} ),
						};
					} ),
				} );
			}

			const previousSiteSubscriptionDetails = await alterSiteSubscriptionDetails(
				queryClient,
				{ blogId: String( blog_id ), subscriptionId: String( subscriptionId ), isLoggedIn, id },
				( previousData ) => {
					return {
						...previousData,
						delivery_methods: {
							...previousData.delivery_methods,
							email: {
								...previousData.delivery_methods?.email,
								send_comments: send_comments,
							},
						},
					} as SiteSubscriptionDetails;
				}
			);

			return {
				previousSiteSubscriptions,
				previousSiteSubscriptionDetails,
			};
		},
		onError: ( _err, _, context ) => {
			if ( context?.previousSiteSubscriptions ) {
				queryClient.setQueryData(
					buildQueryKey( [ 'read', 'site-subscriptions' ], isLoggedIn, id ),
					context.previousSiteSubscriptions
				);
			}

			if ( context?.previousSiteSubscriptionDetails ) {
				for ( const { key, data } of context.previousSiteSubscriptionDetails ) {
					queryClient.setQueryData( key, data );
				}
			}
		},
		onSettled: ( _data, _err, { blog_id, subscriptionId } ) => {
			invalidateSiteSubscriptionDetails( queryClient, {
				blogId: String( blog_id ),
				subscriptionId: String( subscriptionId ),
				isLoggedIn,
				id,
			} );
			queryClient.invalidateQueries( {
				queryKey: [ 'read', 'subscriptions', subscriptionId, isLoggedIn, id ],
			} );
		},
	} );
};

export default useSiteEmailMeNewCommentsMutation;
