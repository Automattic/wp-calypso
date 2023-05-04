import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import type { SiteSubscriptionsPages } from '../types';

type SiteSubscriptionEmailMeNewCommentsParams = {
	send_comments: boolean;
	blog_id: number | string;
};

type SiteSubscriptionEmailMeNewCommentsResponse = {
	success: boolean;
	subscribed: boolean;
};

const useSiteEmailMeNewCommentsMutation = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();

	const siteSubscriptionsCacheKey = useCacheKey( [ 'read', 'site-subscriptions' ] );

	return useMutation(
		async ( params: SiteSubscriptionEmailMeNewCommentsParams ) => {
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
		{
			onMutate: async ( params ) => {
				await queryClient.cancelQueries( siteSubscriptionsCacheKey );

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
												email: {
													...siteSubscription.delivery_methods?.email,
													send_comments: params.send_comments,
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
				return { previousSiteSubscriptions };
			},

			onError: ( err, params, context ) => {
				if ( context?.previousSiteSubscriptions ) {
					queryClient.setQueryData( siteSubscriptionsCacheKey, context.previousSiteSubscriptions );
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries( [ 'read', 'site-subscriptions' ] );
			},
		}
	);
};

export default useSiteEmailMeNewCommentsMutation;
