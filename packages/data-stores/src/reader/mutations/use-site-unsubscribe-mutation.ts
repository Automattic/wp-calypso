import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildQueryKey, callApi, getSubscriptionMutationParams, isValidId } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import {
	SiteSubscriptionsPages,
	SubscriptionManagerSubscriptionsCount,
	SiteSubscriptionDetails,
} from '../types';

type UnsubscribeParams = {
	subscriptionId: number;
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

const buildSiteSubscriptionDetailsByBlogIdQueryKey = (
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

const buildSiteSubscriptionDetailsQueryKey = (
	subscriptionId: number,
	isLoggedIn: boolean,
	userId?: number
) => {
	return [ 'read', 'subscriptions', subscriptionId, isLoggedIn, userId ];
};

const useSiteUnsubscribeMutation = () => {
	const { isLoggedIn, id: userId } = useIsLoggedIn();
	const queryClient = useQueryClient();
	const siteSubscriptionsQueryKey = useCacheKey( [ 'read', 'site-subscriptions' ] );
	const subscriptionsCountQueryKey = useCacheKey( [ 'read', 'subscriptions-count' ] );

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
			const siteSubscriptionDetailsQueryKey = buildSiteSubscriptionDetailsQueryKey(
				params.subscriptionId,
				isLoggedIn,
				userId
			);

			await queryClient.cancelQueries( siteSubscriptionsQueryKey );
			await queryClient.cancelQueries( subscriptionsCountQueryKey );
			await queryClient.cancelQueries( siteSubscriptionDetailsQueryKey );

			const previousSiteSubscriptions =
				queryClient.getQueryData< SiteSubscriptionsPages >( siteSubscriptionsQueryKey );
			// remove blog from site subscriptions
			if ( previousSiteSubscriptions ) {
				queryClient.setQueryData( siteSubscriptionsQueryKey, {
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
					subscriptionsCountQueryKey
				);

			// decrement the blog count
			if ( previousSubscriptionsCount ) {
				queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
					subscriptionsCountQueryKey,
					{
						...previousSubscriptionsCount,
						blogs: previousSubscriptionsCount?.blogs ? previousSubscriptionsCount?.blogs - 1 : null,
					}
				);
			}

			const previousSiteSubscriptionDetails = queryClient.getQueryData< SiteSubscriptionDetails >(
				siteSubscriptionDetailsQueryKey
			);
			if ( previousSiteSubscriptionDetails ) {
				queryClient.setQueryData( siteSubscriptionDetailsQueryKey, {
					...previousSiteSubscriptionDetails,
					subscriber_count: previousSiteSubscriptionDetails.subscriber_count - 1,
				} );
			}

			let previousSiteSubscriptionDetailsByBlogId: SiteSubscriptionDetails | undefined;
			if ( isValidId( params.blog_id ) ) {
				const siteSubscriptionDetailsCacheKey = buildSiteSubscriptionDetailsByBlogIdQueryKey(
					params.blog_id,
					isLoggedIn,
					userId
				);

				await queryClient.cancelQueries( siteSubscriptionDetailsCacheKey );

				previousSiteSubscriptionDetailsByBlogId = queryClient.getQueryData(
					siteSubscriptionDetailsCacheKey
				);

				if ( previousSiteSubscriptionDetailsByBlogId ) {
					queryClient.setQueryData( siteSubscriptionDetailsCacheKey, {
						...previousSiteSubscriptionDetailsByBlogId,
						subscriber_count: previousSiteSubscriptionDetailsByBlogId.subscriber_count - 1,
					} );
				}
			}

			return {
				previousSiteSubscriptions,
				previousSubscriptionsCount,
				previousSiteSubscriptionDetails,
				previousSiteSubscriptionDetailsByBlogId,
			};
		},
		onError: ( _error, params, context ) => {
			if ( context?.previousSiteSubscriptions ) {
				queryClient.setQueryData( siteSubscriptionsQueryKey, context.previousSiteSubscriptions );
			}
			if ( context?.previousSubscriptionsCount ) {
				queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
					subscriptionsCountQueryKey,
					context.previousSubscriptionsCount
				);
			}
			if ( context?.previousSiteSubscriptionDetails ) {
				queryClient.setQueryData(
					buildSiteSubscriptionDetailsQueryKey( params.subscriptionId, isLoggedIn, userId ),
					{
						...context.previousSiteSubscriptionDetails,
						subscriber_count: context.previousSiteSubscriptionDetails.subscriber_count + 1,
					}
				);
			}
			if ( context?.previousSiteSubscriptionDetailsByBlogId && isValidId( params.blog_id ) ) {
				const siteSubscriptionDetailsCacheKey = buildSiteSubscriptionDetailsByBlogIdQueryKey(
					params.blog_id,
					isLoggedIn,
					userId
				);
				queryClient.setQueryData(
					siteSubscriptionDetailsCacheKey,
					context.previousSiteSubscriptionDetailsByBlogId
				);
			}
		},
		onSettled: ( _data, _error, params ) => {
			if ( params.doNotInvalidateSiteSubscriptions !== true ) {
				queryClient.invalidateQueries( siteSubscriptionsQueryKey );
			}

			if ( isValidId( params.blog_id ) ) {
				const siteSubscriptionDetailsByBlogIdQueryKey =
					buildSiteSubscriptionDetailsByBlogIdQueryKey( params.blog_id, isLoggedIn, userId );
				queryClient.invalidateQueries( siteSubscriptionDetailsByBlogIdQueryKey, {
					refetchType: 'none',
				} );
				queryClient.invalidateQueries( [ 'read', 'sites', Number( params.blog_id ) ] );
			}

			queryClient.invalidateQueries( subscriptionsCountQueryKey );
			queryClient.invalidateQueries( [ 'read', 'feed', 'search' ] );
			queryClient.invalidateQueries(
				buildSiteSubscriptionDetailsQueryKey( params.subscriptionId, isLoggedIn, userId )
			);
		},
	} );
};

export default useSiteUnsubscribeMutation;
