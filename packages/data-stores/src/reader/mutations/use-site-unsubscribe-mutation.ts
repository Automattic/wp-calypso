import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callApi, getSubscriptionMutationParams } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import {
	SiteSubscriptionsPages,
	SubscriptionManagerSubscriptionsCount,
	SiteSubscriptionDetails,
} from '../types';

type UnsubscribeParams = {
	blog_id: number | string;
	url?: string;
	doNotInvalidateSiteSubscriptions?: boolean;
	emailId?: string;
};

type UnsubscribeResponse = {
	success?: boolean;
	subscribed?: boolean;
	subscription?: null;
};

const useSiteUnsubscribeMutation = ( blog_id?: string ) => {
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
		mutationFn: async ( params: UnsubscribeParams ) => {
			if ( ! params.blog_id ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while unsubscribing.'
				);
			}

			const { path, apiVersion, body } = getSubscriptionMutationParams(
				'delete',
				isLoggedIn,
				params.blog_id,
				params.url,
				params.emailId
			);

			const response = await callApi< UnsubscribeResponse >( {
				path,
				method: 'POST',
				isLoggedIn,
				apiVersion,
				body,
			} );
			if (
				'success' in response &&
				response.success === false &&
				'subscribed' in response &&
				response.subscribed === true
			) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while unsubscribing.'
				);
			}

			return response;
		},
		onMutate: async ( params ) => {
			await queryClient.cancelQueries( siteSubscriptionsCacheKey );
			await queryClient.cancelQueries( subscriptionsCountCacheKey );
			await queryClient.cancelQueries( siteSubscriptionDetailsCacheKey );

			const previousSiteSubscriptions =
				queryClient.getQueryData< SiteSubscriptionsPages >( siteSubscriptionsCacheKey );
			// remove blog from site subscriptions
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
									siteSubscription.blog_ID === params.blog_id ? true : siteSubscription.isDeleted,
							} ) ),
						};
					} ),
				} );
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
						blogs: previousSubscriptionsCount?.blogs ? previousSubscriptionsCount?.blogs - 1 : null,
					}
				);
			}

			const previousSiteSubscriptionDetails = queryClient.getQueryData< SiteSubscriptionDetails >(
				siteSubscriptionDetailsCacheKey
			);

			if ( previousSiteSubscriptionDetails ) {
				queryClient.setQueryData( siteSubscriptionDetailsCacheKey, {
					...previousSiteSubscriptionDetails,
					subscriber_count: previousSiteSubscriptionDetails.subscriber_count - 1,
				} );
			}

			return {
				previousSiteSubscriptions,
				previousSubscriptionsCount,
				previousSiteSubscriptionDetails,
			};
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
			if ( context?.previousSiteSubscriptionDetails ) {
				queryClient.setQueryData(
					siteSubscriptionDetailsCacheKey,
					context.previousSiteSubscriptionDetails
				);
			}
		},
		onSettled: ( _data, _error, params ) => {
			if ( params.doNotInvalidateSiteSubscriptions !== true ) {
				queryClient.invalidateQueries( siteSubscriptionsCacheKey );
			}
			queryClient.invalidateQueries( subscriptionsCountCacheKey );
			queryClient.invalidateQueries( siteSubscriptionDetailsCacheKey, { refetchType: 'none' } );
			queryClient.invalidateQueries( [ 'read', 'feed', 'search' ] );
			params.blog_id &&
				queryClient.invalidateQueries( [ 'read', 'sites', Number( params.blog_id ) ] );
		},
	} );
};

export default useSiteUnsubscribeMutation;
