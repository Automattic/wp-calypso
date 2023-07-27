import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildQueryKey, callApi, getSubscriptionMutationParams, isValidId } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import {
	SiteSubscriptionsPages,
	SubscriptionManagerSubscriptionsCount,
	SiteSubscriptionDetails,
} from '../types';

type UnsubscribeParams = {
	subscriptionId?: number;
	url?: string;
	blog_id?: number | string;
	doNotInvalidateSiteSubscriptions?: boolean;
	emailId?: string;
};

type UnsubscribeResponse = {
	success?: boolean;
	subscribed?: boolean;
	subscription?: null;
};

const buildSiteSubscriptionDetailsQueryKey = (
	blogId: number | string,
	isLoggedIn: boolean,
	userId?: number
) => {
	return buildQueryKey(
		[ 'read', 'site-subscription-details', String( blogId ) ],
		isLoggedIn,
		userId
	);
};

const useSiteUnsubscribeMutation = () => {
	const { isLoggedIn, id: userId } = useIsLoggedIn();
	const queryClient = useQueryClient();
	const siteSubscriptionsCacheKey = useCacheKey( [ 'read', 'site-subscriptions' ] );
	const subscriptionsCountCacheKey = useCacheKey( [ 'read', 'subscriptions-count' ] );

	return useMutation( {
		mutationFn: async ( params: UnsubscribeParams ) => {
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
									Number( siteSubscription.ID ) === params.subscriptionId ||
									( isValidId( params.blog_id ) && siteSubscription.blog_ID === params.blog_id ) //siteSubscription.blog_ID is not valid ID for non-wpcom subscriptions, so when unsubscribing from such site, the param.blog_id will also be not valid, this would create false positive
										? true
										: siteSubscription.isDeleted,
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

			let previousSiteSubscriptionDetails: SiteSubscriptionDetails | undefined;
			if ( isValidId( params.blog_id ) ) {
				const siteSubscriptionDetailsCacheKey = buildSiteSubscriptionDetailsQueryKey(
					params.blog_id,
					isLoggedIn,
					userId
				);

				await queryClient.cancelQueries( siteSubscriptionDetailsCacheKey );

				previousSiteSubscriptionDetails = queryClient.getQueryData(
					siteSubscriptionDetailsCacheKey
				);

				if ( previousSiteSubscriptionDetails ) {
					queryClient.setQueryData( siteSubscriptionDetailsCacheKey, {
						...previousSiteSubscriptionDetails,
						subscriber_count: previousSiteSubscriptionDetails.subscriber_count - 1,
					} );
				}
			}

			return {
				previousSiteSubscriptions,
				previousSubscriptionsCount,
				previousSiteSubscriptionDetails,
			};
		},
		onError: ( error, params, context ) => {
			if ( context?.previousSiteSubscriptions ) {
				queryClient.setQueryData( siteSubscriptionsCacheKey, context.previousSiteSubscriptions );
			}
			if ( context?.previousSubscriptionsCount ) {
				queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
					subscriptionsCountCacheKey,
					context.previousSubscriptionsCount
				);
			}
			if ( context?.previousSiteSubscriptionDetails && isValidId( params.blog_id ) ) {
				const siteSubscriptionDetailsCacheKey = buildSiteSubscriptionDetailsQueryKey(
					params.blog_id,
					isLoggedIn,
					userId
				);
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

			if ( isValidId( params.blog_id ) ) {
				const siteSubscriptionDetailsCacheKey = buildSiteSubscriptionDetailsQueryKey(
					params.blog_id,
					isLoggedIn,
					userId
				);
				queryClient.invalidateQueries( siteSubscriptionDetailsCacheKey, { refetchType: 'none' } );
				queryClient.invalidateQueries( [ 'read', 'sites', Number( params.blog_id ) ] );
			}

			queryClient.invalidateQueries( subscriptionsCountCacheKey );
			queryClient.invalidateQueries( [ 'read', 'feed', 'search' ] );
		},
	} );
};

export default useSiteUnsubscribeMutation;
