import {
	getSiteSubscriptionsQueryKey,
	type SiteSubscriptionsInfiniteData,
} from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callApi } from '../helpers';
import {
	alterSiteSubscriptionDetails,
	invalidateSiteSubscriptionDetails,
} from '../helpers/optimistic-update';
import { useIsLoggedIn } from '../hooks';
import type { SiteSubscriptionDetails } from '../types';

type SiteSubscriptionEmailMeNewPostsParams = {
	send_posts: boolean;
	blog_id: number | string;
	subscriptionId: number;
};

type SiteSubscriptionEmailMeNewPostsResponse = {
	success: boolean;
	subscribed: boolean;
};

const useSiteEmailMeNewPostsMutation = () => {
	const { id, isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: async ( params: SiteSubscriptionEmailMeNewPostsParams ) => {
			if ( ! params.blog_id || typeof params.send_posts !== 'boolean' ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while changing the "Email me new posts" setting.'
				);
			}

			const action = params.send_posts ? 'new' : 'delete';

			const response = await callApi< SiteSubscriptionEmailMeNewPostsResponse >( {
				path: `/read/site/${ params.blog_id }/post_email_subscriptions/${ action }`,
				method: 'POST',
				body: {},
				isLoggedIn,
				apiVersion: '1.2',
			} );
			if ( ! response.success ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while changing the "Email me new posts" setting.'
				);
			}

			return response;
		},
		onMutate: async ( { blog_id, send_posts, subscriptionId } ) => {
			const siteSubscriptionsQueryKey = getSiteSubscriptionsQueryKey();

			await queryClient.cancelQueries( { queryKey: siteSubscriptionsQueryKey } );

			const previousSiteSubscriptions =
				queryClient.getQueryData< SiteSubscriptionsInfiniteData >( siteSubscriptionsQueryKey );
			if ( previousSiteSubscriptions ) {
				queryClient.setQueryData( siteSubscriptionsQueryKey, {
					...previousSiteSubscriptions,
					pages: previousSiteSubscriptions.pages.map( ( page ) => {
						return {
							...page,
							subscriptions: page.subscriptions.map( ( siteSubscription ) => {
								if ( Number( siteSubscription.blog_ID ) === Number( blog_id ) ) {
									return {
										...siteSubscription,
										delivery_methods: {
											...siteSubscription.delivery_methods,
											email: {
												...siteSubscription.delivery_methods?.email,
												send_posts: send_posts,
												// Pausing deletes the subscription server-side, dropping the
												// stored cadence. Mirror that so the cached frequency doesn't
												// linger as stale data once email delivery is off.
												...( ! send_posts && { post_delivery_frequency: undefined } ),
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
				{
					blogId: String( blog_id ),
					subscriptionId: String( subscriptionId ),
					isLoggedIn,
					id,
				},
				( siteSubscriptionDetails ) => {
					return {
						...siteSubscriptionDetails,
						delivery_methods: {
							...siteSubscriptionDetails.delivery_methods,
							email: {
								...siteSubscriptionDetails.delivery_methods?.email,
								send_posts: send_posts,
								...( ! send_posts && { post_delivery_frequency: undefined } ),
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
					getSiteSubscriptionsQueryKey(),
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

export default useSiteEmailMeNewPostsMutation;
