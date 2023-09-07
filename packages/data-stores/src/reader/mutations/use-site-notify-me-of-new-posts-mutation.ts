import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildQueryKey, callApi } from '../helpers';
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
			const siteSubscriptionDetailsByBlogIdQueryKey = buildQueryKey(
				[ 'read', 'site-subscription-details', String( blog_id ) ],
				isLoggedIn,
				id
			);
			const siteSubscriptionDetailsQueryKey = [
				'read',
				'subscriptions',
				subscriptionId,
				isLoggedIn,
				id,
			];

			await queryClient.cancelQueries( siteSubscriptionsQueryKey );
			await queryClient.cancelQueries( siteSubscriptionDetailsByBlogIdQueryKey );
			await queryClient.cancelQueries( siteSubscriptionDetailsQueryKey );

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

			const previousSiteSubscriptionDetailsByBlogId =
				queryClient.getQueryData< SiteSubscriptionDetails >(
					siteSubscriptionDetailsByBlogIdQueryKey
				);

			if ( previousSiteSubscriptionDetailsByBlogId ) {
				queryClient.setQueryData( siteSubscriptionDetailsByBlogIdQueryKey, {
					...previousSiteSubscriptionDetailsByBlogId,
					delivery_methods: {
						...previousSiteSubscriptionDetailsByBlogId.delivery_methods,
						notification: {
							...previousSiteSubscriptionDetailsByBlogId.delivery_methods?.notification,
							send_posts,
						},
					},
				} );
			}

			const previousSiteSubscriptionDetails = queryClient.getQueryData< SiteSubscriptionDetails >(
				siteSubscriptionDetailsQueryKey
			);

			if ( previousSiteSubscriptionDetails ) {
				queryClient.setQueryData( siteSubscriptionDetailsQueryKey, {
					...previousSiteSubscriptionDetails,
					delivery_methods: {
						...previousSiteSubscriptionDetails.delivery_methods,
						notification: {
							...previousSiteSubscriptionDetails.delivery_methods?.notification,
							send_posts,
						},
					},
				} );
			}

			return {
				previousSiteSubscriptions,
				previousSiteSubscriptionDetailsByBlogId,
				previousSiteSubscriptionDetails,
			};
		},
		onError: ( err, { blog_id, subscriptionId }, context ) => {
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
					context.previousSiteSubscriptionDetailsByBlogId
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

export default useSiteNotifyMeOfNewPostsMutation;
