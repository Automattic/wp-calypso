import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildQueryKey, callApi } from '../helpers';
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
			const siteSubscriptionDetailsByBlogIdQueryKey = buildQueryKey(
				[ 'read', 'site-subscription-details', String( blog_id ) ],
				isLoggedIn,
				id
			);
			const siteSubscriptionDetailsCacheKey = [
				'read',
				'subscriptions',
				subscriptionId,
				isLoggedIn,
				id,
			];

			await queryClient.cancelQueries( siteSubscriptionsQueryKey );
			await queryClient.cancelQueries( siteSubscriptionDetailsByBlogIdQueryKey );
			await queryClient.cancelQueries( siteSubscriptionDetailsCacheKey );

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

			const previousSiteSubscriptionDetails = queryClient.getQueryData< SiteSubscriptionDetails >(
				siteSubscriptionDetailsCacheKey
			);
			if ( previousSiteSubscriptionDetails ) {
				queryClient.setQueryData( siteSubscriptionDetailsCacheKey, {
					...previousSiteSubscriptionDetails,
					delivery_methods: {
						...previousSiteSubscriptionDetails.delivery_methods,
						email: {
							...previousSiteSubscriptionDetails.delivery_methods?.email,
							send_posts: send_posts,
						},
					},
				} );
			}

			const previousSiteSubscriptionDetailsByBlogId =
				queryClient.getQueryData< SiteSubscriptionDetails >(
					siteSubscriptionDetailsByBlogIdQueryKey
				);
			if ( previousSiteSubscriptionDetailsByBlogId ) {
				queryClient.setQueryData( siteSubscriptionDetailsByBlogIdQueryKey, {
					...previousSiteSubscriptionDetailsByBlogId,
					delivery_methods: {
						...previousSiteSubscriptionDetailsByBlogId.delivery_methods,
						email: {
							...previousSiteSubscriptionDetailsByBlogId.delivery_methods?.email,
							send_posts: send_posts,
						},
					},
				} );
			}

			return {
				previousSiteSubscriptions,
				previousSiteSubscriptionDetails,
				previousSiteSubscriptionDetailsByBlogId,
			};
		},
		onError: ( _err, { blog_id, subscriptionId }, context ) => {
			if ( context?.previousSiteSubscriptions ) {
				queryClient.setQueryData(
					buildQueryKey( [ 'read', 'site-subscriptions' ], isLoggedIn, id ),
					context.previousSiteSubscriptions
				);
			}
			if ( context?.previousSiteSubscriptionDetails ) {
				queryClient.setQueryData(
					[ 'read', 'subscriptions', subscriptionId, isLoggedIn, id ],
					context.previousSiteSubscriptionDetails
				);
			}
			if ( context?.previousSiteSubscriptionDetailsByBlogId ) {
				queryClient.setQueryData(
					buildQueryKey(
						[ 'read', 'site-subscription-details', String( blog_id ) ],
						isLoggedIn,
						id
					),
					context.previousSiteSubscriptionDetails
				);
			}
		},
		onSettled: ( _data, _err, { blog_id, subscriptionId } ) => {
			queryClient.invalidateQueries( [ 'read', 'site-subscriptions' ] );
			queryClient.invalidateQueries(
				buildQueryKey( [ 'read', 'site-subscription-details', String( blog_id ) ], isLoggedIn, id )
			);
			queryClient.invalidateQueries( [ 'read', 'subscriptions', subscriptionId, isLoggedIn, id ] );
		},
	} );
};

export default useSiteEmailMeNewPostsMutation;
