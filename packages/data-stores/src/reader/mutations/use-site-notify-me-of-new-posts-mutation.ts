import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildQueryKey, callApi } from '../helpers';
import {
	alterSiteSubscriptionDetails,
	invalidateSiteSubscriptionDetails,
} from '../helpers/optimistic-update';
import { useIsLoggedIn } from '../hooks';
import type { SiteSubscriptionsPages, SiteSubscriptionDetails } from '../types';

type SiteSubscriptionNotifyMeOfNewPostsParams = {
	send_posts: boolean;
	blog_id: number | string;
	subscriptionId: number;
};

type SiteSubscriptionNotifyMeOfNewPostsResponse = {
	success: boolean;
	subscribed: boolean;
};

const useSiteNotifyMeOfNewPostsMutation = () => {
	const { id, isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: async ( params: SiteSubscriptionNotifyMeOfNewPostsParams ) => {
			if ( ! params.blog_id || typeof params.send_posts !== 'boolean' ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while changing the "Notify me of new posts" setting.'
				);
			}

			const action = params.send_posts ? 'new' : 'delete';

			const response = await callApi< SiteSubscriptionNotifyMeOfNewPostsResponse >( {
				apiNamespace: 'wpcom/v2',
				path: `/read/sites/${ params.blog_id }/notification-subscriptions/${ action }`,
				method: 'POST',
				body: {},
				isLoggedIn,
				apiVersion: '2',
			} );
			if ( ! response.success ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while changing the "Notify me of new posts" setting.'
				);
			}

			return response;
		},
		onMutate: async ( { blog_id, send_posts, subscriptionId } ) => {
			const siteSubscriptionsQueryKey = buildQueryKey(
				[ 'read', 'site-subscriptions' ],
				isLoggedIn,
				id
			);

			await queryClient.cancelQueries( siteSubscriptionsQueryKey );

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
											notification: {
												...siteSubscription.delivery_methods?.notification,
												send_posts,
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
				( previousData ) => {
					return {
						...previousData,
						delivery_methods: {
							...previousData.delivery_methods,
							notification: {
								...previousData.delivery_methods?.notification,
								send_posts,
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
		onError: ( err, _, context ) => {
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

export default useSiteNotifyMeOfNewPostsMutation;
