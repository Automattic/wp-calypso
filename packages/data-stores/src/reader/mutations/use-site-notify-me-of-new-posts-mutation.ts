import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import type { SiteSubscriptionsPages, SiteSubscriptionDetails } from '../types';

type SiteSubscriptionNotifyMeOfNewPostsParams = {
	send_posts: boolean;
	blog_id: number | string;
};

type SiteSubscriptionNotifyMeOfNewPostsResponse = {
	success: boolean;
	subscribed: boolean;
};

const useSiteNotifyMeOfNewPostsMutation = ( blog_id?: string ) => {
	const { isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();

	const siteSubscriptionsCacheKey = useCacheKey( [ 'read', 'site-subscriptions' ] );
	const siteSubscriptionDetailsCacheKey = useCacheKey( [
		'read',
		'site-subscription-details',
		...( blog_id ? [ blog_id ] : [] ),
	] );

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
		onMutate: async ( params ) => {
			await queryClient.cancelQueries( siteSubscriptionsCacheKey );
			await queryClient.cancelQueries( siteSubscriptionDetailsCacheKey );

			const previousSiteSubscriptions =
				queryClient.getQueryData< SiteSubscriptionsPages >( siteSubscriptionsCacheKey );

			if ( previousSiteSubscriptions ) {
				queryClient.setQueryData( siteSubscriptionsCacheKey, {
					...previousSiteSubscriptions,
					pages: previousSiteSubscriptions.pages.map( ( page ) => {
						return {
							...page,
							subscriptions: page.subscriptions.map( ( siteSubscription ) => {
								if ( siteSubscription.blog_ID === params.blog_id ) {
									return {
										...siteSubscription,
										delivery_methods: {
											...siteSubscription.delivery_methods,
											notification: {
												...siteSubscription.delivery_methods?.notification,
												send_posts: params.send_posts,
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
						notification: {
							...previousSiteSubscriptionDetails.delivery_methods?.notification,
							send_posts: params.send_posts,
						},
					},
				} );
			}

			return { previousSiteSubscriptions, previousSiteSubscriptionDetails };
		},
		onError: ( err, params, context ) => {
			if ( context?.previousSiteSubscriptions ) {
				queryClient.setQueryData( siteSubscriptionsCacheKey, context.previousSiteSubscriptions );
			}
			if ( context?.previousSiteSubscriptionDetails ) {
				queryClient.setQueryData(
					siteSubscriptionDetailsCacheKey,
					context.previousSiteSubscriptionDetails
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries( [ 'read', 'site-subscriptions' ] );
			queryClient.invalidateQueries( siteSubscriptionDetailsCacheKey );
		},
	} );
};

export default useSiteNotifyMeOfNewPostsMutation;
