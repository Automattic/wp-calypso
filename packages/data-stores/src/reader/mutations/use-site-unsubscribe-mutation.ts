import { useMutation, useQueryClient } from 'react-query';
import { applyCallbackToPages, callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import {
	PagedQueryResult,
	SiteSubscription,
	SubscriptionManagerSubscriptionsCount,
} from '../types';

type SiteSubscriptionUnsubscribeParams = {
	blog_id: number | string;
};

type SiteSubscriptionUnsubscribeResponse = {
	success: boolean;
	subscribed: boolean;
	subscription: null;
};

const useSiteUnsubscribeMutation = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();
	const siteSubscriptionsCacheKey = useCacheKey( [ 'read', 'site-subscriptions' ] );
	const subscriptionsCountCacheKey = useCacheKey( [ 'read', 'subscriptions-count' ] );

	return useMutation(
		async ( params: SiteSubscriptionUnsubscribeParams ) => {
			if ( ! params.blog_id ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while unsubscribing.'
				);
			}

			const response = await callApi< SiteSubscriptionUnsubscribeResponse >( {
				path: `/read/site/${ params.blog_id }/post_email_subscriptions/delete`,
				method: 'POST',
				isLoggedIn,
				apiVersion: '1.2',
			} );
			if ( ! response.success ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while unsubscribing.'
				);
			}

			return response;
		},
		{
			onMutate: async ( params ) => {
				await queryClient.cancelQueries( siteSubscriptionsCacheKey );
				await queryClient.cancelQueries( subscriptionsCountCacheKey );

				const previousSiteSubscriptions =
					queryClient.getQueryData< PagedQueryResult< SiteSubscription, 'subscriptions' > >(
						siteSubscriptionsCacheKey
					);
				// remove blog from site subscriptions
				if ( previousSiteSubscriptions ) {
					const mutatedSiteSubscriptions = applyCallbackToPages<
						'subscriptions',
						SiteSubscription
					>( previousSiteSubscriptions, ( page ) => {
						return {
							subscriptions: page.subscriptions.filter(
								( siteSubscription ) => siteSubscription.blog_ID !== params.blog_id
							),
						};
					} );
					queryClient.setQueryData( siteSubscriptionsCacheKey, mutatedSiteSubscriptions );
				}

				const previousSubscriptionsCount =
					queryClient.getQueryData< SubscriptionManagerSubscriptionsCount >(
						subscriptionsCountCacheKey
					);

				// decrement the blog count
				if ( previousSubscriptionsCount ) {
					queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
						subscriptionsCountCacheKey,
						{
							...previousSubscriptionsCount,
							blogs: previousSubscriptionsCount?.blogs
								? previousSubscriptionsCount?.blogs - 1
								: null,
						}
					);
				}

				return { previousSiteSubscriptions, previousSubscriptionsCount };
			},
			onError: ( error, variables, context ) => {
				if ( context?.previousSiteSubscriptions ) {
					queryClient.setQueryData( siteSubscriptionsCacheKey, context.previousSiteSubscriptions );
				}
				if ( context?.previousSubscriptionsCount ) {
					queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
						subscriptionsCountCacheKey,
						context.previousSubscriptionsCount
					);
				}
			},
			onSettled: () => {
				// pass in more minimal keys, everything to the right will be invalidated
				queryClient.invalidateQueries( [ 'read', 'site-subscriptions' ] );
				queryClient.invalidateQueries( [ 'read', 'subscriptions-count' ] );
			},
		}
	);
};

export default useSiteUnsubscribeMutation;
