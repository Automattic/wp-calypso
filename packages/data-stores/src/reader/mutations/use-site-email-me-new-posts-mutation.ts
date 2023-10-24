import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildQueryKey, callApi } from '../helpers';
import { alterSiteSubscriptionDetails } from '../helpers/optimistic-update';
import { useIsLoggedIn } from '../hooks';
import type { SiteSubscriptionsPages, SiteSubscriptionDetails } from '../types';

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
											email: {
												...siteSubscription.delivery_methods?.email,
												send_posts: send_posts,
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
			queryClient.invalidateQueries( [ 'read', 'site-subscriptions' ] );
			queryClient.invalidateQueries(
				buildQueryKey( [ 'read', 'site-subscription-details', String( blog_id ) ], isLoggedIn, id )
			);
			queryClient.invalidateQueries(
				buildQueryKey(
					[ 'read', 'site-subscription-details', '', String( subscriptionId ) ],
					isLoggedIn,
					id
				)
			);
			queryClient.invalidateQueries( [ 'read', 'subscriptions', subscriptionId, isLoggedIn, id ] );
		},
	} );
};

export default useSiteEmailMeNewPostsMutation;
