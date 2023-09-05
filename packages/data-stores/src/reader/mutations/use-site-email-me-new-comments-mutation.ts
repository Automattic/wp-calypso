import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildQueryKey, callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import type { SiteSubscriptionsPages, SiteSubscriptionDetails } from '../types';

type SiteSubscriptionEmailMeNewCommentsParams = {
	send_comments: boolean;
	blog_id: number | string;
	subscriptionId: number;
};

type SiteSubscriptionEmailMeNewCommentsResponse = {
	success: boolean;
	subscribed: boolean;
};

const useSiteEmailMeNewCommentsMutation = () => {
	const { id, isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: async ( params: SiteSubscriptionEmailMeNewCommentsParams ) => {
			if ( ! params.blog_id || typeof params.send_comments !== 'boolean' ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while changing the "Email me new comments" setting.'
				);
			}

			const action = params.send_comments ? 'new' : 'delete';

			const response = await callApi< SiteSubscriptionEmailMeNewCommentsResponse >( {
				path: `/read/site/${ params.blog_id }/comment_email_subscriptions/${ action }`,
				method: 'POST',
				body: {},
				isLoggedIn,
				apiVersion: '1.2',
			} );
			if ( ! response.success ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while changing the "Email me comments posts" setting.'
				);
			}

			return response;
		},
		onMutate: async ( { blog_id, send_comments, subscriptionId } ) => {
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
							send_comments: send_comments,
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
						email: {
							...previousSiteSubscriptionDetails.delivery_methods?.email,
							send_comments: send_comments,
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
		onError: ( _err, { blog_id, subscriptionId }, context ) => {
			if ( context?.previousSiteSubscriptions ) {
				queryClient.setQueryData(
					buildQueryKey( [ 'read', 'site-subscriptions' ], isLoggedIn, id ),
					context.previousSiteSubscriptions
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
			if ( context?.previousSiteSubscriptionDetails ) {
				queryClient.setQueryData(
					[ 'read', 'subscriptions', subscriptionId, isLoggedIn, id ],
					context.previousSiteSubscriptionDetails
				);
			}
		},
		onSettled: ( _data, _err, { subscriptionId } ) => {
			queryClient.invalidateQueries( [ 'read', 'site-subscriptions' ] );
			queryClient.invalidateQueries(
				buildQueryKey( [ 'read', 'site-subscription-details' ], isLoggedIn, id )
			);
			queryClient.invalidateQueries( [ 'read', 'subscriptions', subscriptionId, isLoggedIn, id ] );
		},
	} );
};

export default useSiteEmailMeNewCommentsMutation;
