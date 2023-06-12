import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callApi, getSubscriptionMutationParams } from '../helpers';
import { useIsLoggedIn, useCacheKey } from '../hooks';
import { SiteSubscriptionsPages } from '../types';
import type { SiteSubscriptionDetails } from '../types';

type SubscribeParams = {
	blog_id?: number | string;
	url?: string;
	doNotInvalidateSiteSubscriptions?: boolean;
};

type SubscribeResponse = {
	success?: boolean;
	subscribed?: boolean;
	subscription?: {
		blog_ID: string;
		delivery_frequency: string;
		status: string;
		ts: string;
	};
};

const useSiteSubscribeMutation = ( blog_id?: string ) => {
	const { isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();
	const siteSubscriptionsCacheKey = useCacheKey( [ 'read', 'site-subscriptions' ] );
	const subscriptionsCountCacheKey = useCacheKey( [ 'read', 'subscriptions-count' ] );
	const siteSubscriptionDetailsCacheKey = useCacheKey( [
		'read',
		'site-subscription-details',
		...( blog_id ? [ blog_id ] : [] ),
	] );

	return useMutation( {
		mutationFn: async ( params: SubscribeParams ) => {
			if ( ! params.blog_id ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while subscribing.'
				);
			}

			const { path, apiVersion, body } = getSubscriptionMutationParams(
				'new',
				isLoggedIn,
				params.blog_id,
				params.url
			);

			const response = await callApi< SubscribeResponse >( {
				path,
				method: 'POST',
				isLoggedIn,
				apiVersion,
				body,
			} );
			if ( ! response.subscribed ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while subscribing.'
				);
			}

			return response;
		},
		onMutate: async ( params ) => {
			await queryClient.cancelQueries( siteSubscriptionDetailsCacheKey );

			const previousSiteSubscriptions =
				queryClient.getQueryData< SiteSubscriptionsPages >( siteSubscriptionsCacheKey );

			if ( previousSiteSubscriptions ) {
				queryClient.setQueryData( siteSubscriptionsCacheKey, {
					...previousSiteSubscriptions,
					pages: previousSiteSubscriptions.pages.map( ( page ) => {
						return {
							...page,
							total_subscriptions: page.total_subscriptions - 1,
							subscriptions: page.subscriptions.map( ( siteSubscription ) => ( {
								...siteSubscription,
								isDeleted:
									siteSubscription.blog_ID === params.blog_id ? false : siteSubscription.isDeleted,
							} ) ),
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
					subscriber_count: previousSiteSubscriptionDetails.subscriber_count + 1,
				} );
			}

			return { previousSiteSubscriptionDetails };
		},
		onError: ( error, variables, context ) => {
			if ( context?.previousSiteSubscriptionDetails ) {
				queryClient.setQueryData(
					siteSubscriptionDetailsCacheKey,
					context.previousSiteSubscriptionDetails
				);
			}
		},
		onSettled: ( _data, _error, params: SubscribeParams ) => {
			if ( params.doNotInvalidateSiteSubscriptions !== true ) {
				queryClient.invalidateQueries( siteSubscriptionsCacheKey );
			}
			queryClient.invalidateQueries( subscriptionsCountCacheKey );
			queryClient.invalidateQueries( siteSubscriptionDetailsCacheKey );
		},
	} );
};

export default useSiteSubscribeMutation;
