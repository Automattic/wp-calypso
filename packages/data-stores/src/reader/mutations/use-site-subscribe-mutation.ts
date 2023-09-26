import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildQueryKey, callApi, getSubscriptionMutationParams, isValidId } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import { SiteSubscriptionsPages } from '../types';
import type { SiteSubscriptionDetails } from '../types';

type SubscribeParams = {
	blogId?: number | string;
	feedId?: number | string;
	url?: string;
	doNotInvalidateSiteSubscriptions?: boolean;
	onSuccess?: () => void;
	onError?: () => void;
	subscriptionId?: number;
};

type SubscribeResponse = {
	info?: string;
	success?: boolean;
	subscribed?: boolean;
	subscription?: {
		blog_ID: string;
		delivery_frequency: string;
		status: string;
		ts: string;
	};
};

const buildSubscriptionDetailsByBlogIdQueryKey = (
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

const useSiteSubscribeMutation = () => {
	const { isLoggedIn, id: userId } = useIsLoggedIn();
	const queryClient = useQueryClient();
	const siteSubscriptionsCacheKey = buildQueryKey(
		[ 'read', 'site-subscriptions' ],
		isLoggedIn,
		userId
	);
	const subscriptionsCountCacheKey = buildQueryKey(
		[ 'read', 'subscriptions-count' ],
		isLoggedIn,
		userId
	);

	return useMutation( {
		mutationFn: async ( params: SubscribeParams ) => {
			const { path, apiVersion, body } = getSubscriptionMutationParams(
				'new',
				isLoggedIn,
				params.blogId,
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
			let previousSiteSubscriptionDetailsByBlogId: SiteSubscriptionDetails | undefined;

			if ( isValidId( params.blogId ) ) {
				const siteSubscriptionDetailsCacheKey = buildSubscriptionDetailsByBlogIdQueryKey(
					params.blogId,
					isLoggedIn,
					userId
				);
				await queryClient.cancelQueries( siteSubscriptionDetailsCacheKey );

				previousSiteSubscriptionDetailsByBlogId =
					queryClient.getQueryData< SiteSubscriptionDetails >( siteSubscriptionDetailsCacheKey );

				if ( previousSiteSubscriptionDetailsByBlogId ) {
					queryClient.setQueryData( siteSubscriptionDetailsCacheKey, {
						...previousSiteSubscriptionDetailsByBlogId,
						subscriber_count: previousSiteSubscriptionDetailsByBlogId.subscriber_count + 1,
					} );
				}
			}

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
									siteSubscription.blog_ID === params.blogId ? false : siteSubscription.isDeleted,
								date_subscribed:
									siteSubscription.blog_ID === params.blogId
										? new Date()
										: siteSubscription.date_subscribed,
							} ) ),
						};
					} ),
				} );
			}

			return {
				previousSiteSubscriptions,
				previousSiteSubscriptionDetails: previousSiteSubscriptionDetailsByBlogId,
			};
		},
		onError: ( _error, params, context ) => {
			if ( context?.previousSiteSubscriptions ) {
				queryClient.setQueryData( siteSubscriptionsCacheKey, context.previousSiteSubscriptions );
			}

			if ( isValidId( params.blogId ) && context?.previousSiteSubscriptionDetails ) {
				const siteSubscriptionDetailsCacheKey = buildSubscriptionDetailsByBlogIdQueryKey(
					String( params.blogId ),
					isLoggedIn,
					userId
				);
				queryClient.setQueryData(
					siteSubscriptionDetailsCacheKey,
					context.previousSiteSubscriptionDetails
				);
			}

			params.onError?.();
		},
		onSettled: ( _data, _error, params: SubscribeParams ) => {
			if ( params.doNotInvalidateSiteSubscriptions !== true ) {
				queryClient.invalidateQueries( siteSubscriptionsCacheKey );
			}

			if ( isValidId( params.blogId ) ) {
				const siteSubscriptionDetailsCacheKey = buildSubscriptionDetailsByBlogIdQueryKey(
					params.blogId,
					isLoggedIn,
					userId
				);
				queryClient.invalidateQueries( siteSubscriptionDetailsCacheKey );
				queryClient.invalidateQueries( [ 'read', 'sites', Number( params.blogId ) ] );
			}

			if ( isValidId( params.feedId ) ) {
				const feedCacheKey = [ 'read', 'feeds', Number( params.feedId ) ];
				queryClient.invalidateQueries( feedCacheKey );
			}

			queryClient.invalidateQueries( subscriptionsCountCacheKey );
		},
		onSuccess: ( data, params ) => {
			params.onSuccess?.();
		},
	} );
};

export default useSiteSubscribeMutation;
