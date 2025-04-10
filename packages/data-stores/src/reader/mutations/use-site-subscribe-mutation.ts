import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildQueryKey, callApi, getSubscriptionMutationParams, isValidId } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import { SiteSubscriptionsPages } from '../types';
import type { SiteSubscriptionDetails } from '../types';

type SubscribeParams = {
	blog_id?: number | string;
	feed_id?: number | string;
	url?: string;
	doNotInvalidateSiteSubscriptions?: boolean;
	onSuccess?: () => void;
	onError?: ( e: Error ) => void;
	subscriptionId?: number;
	resubscribed?: boolean;
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
	blogId: string,
	isLoggedIn: boolean,
	userId?: number
) => {
	return buildQueryKey( [ 'read', 'site-subscription-details', blogId ], isLoggedIn, userId );
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
			const isValidBlogId = isValidId( params.blog_id );
			let previousSiteSubscriptionDetailsByBlogId: SiteSubscriptionDetails | undefined;

			if ( isValidBlogId ) {
				const siteSubscriptionDetailsCacheKey = buildSubscriptionDetailsByBlogIdQueryKey(
					String( params.blog_id ),
					isLoggedIn,
					userId
				);
				await queryClient.cancelQueries( { queryKey: siteSubscriptionDetailsCacheKey } );

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
							subscriptions: page.subscriptions.map( ( siteSubscription ) =>
								siteSubscription.blog_ID === params.blog_id
									? {
											...siteSubscription,
											date_subscribed: new Date(),
											isDeleted: false,
											resubscribed: params.resubscribed ?? false,
									  }
									: siteSubscription
							),
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

			if ( isValidId( params.blog_id ) && context?.previousSiteSubscriptionDetails ) {
				const siteSubscriptionDetailsCacheKey = buildSubscriptionDetailsByBlogIdQueryKey(
					String( params.blog_id ),
					isLoggedIn,
					userId
				);
				queryClient.setQueryData(
					siteSubscriptionDetailsCacheKey,
					context.previousSiteSubscriptionDetails
				);
			}

			params.onError?.( _error );
		},
		onSettled: ( _data, _error, params: SubscribeParams ) => {
			if ( params.doNotInvalidateSiteSubscriptions !== true ) {
				queryClient.invalidateQueries( { queryKey: siteSubscriptionsCacheKey } );
			}

			if ( isValidId( params.blog_id ) ) {
				const siteSubscriptionDetailsCacheKey = buildSubscriptionDetailsByBlogIdQueryKey(
					String( params.blog_id ),
					isLoggedIn,
					userId
				);
				queryClient.invalidateQueries( { queryKey: siteSubscriptionDetailsCacheKey } );
				queryClient.invalidateQueries( {
					queryKey: [ 'read', 'sites', Number( params.blog_id ) ],
				} );
			}

			if ( isValidId( params.feed_id ) ) {
				const feedCacheKey = [ 'read', 'feeds', Number( params.feed_id ) ];
				queryClient.invalidateQueries( {
					queryKey: feedCacheKey,
				} );
			}

			queryClient.invalidateQueries( { queryKey: subscriptionsCountCacheKey } );
		},
		onSuccess: ( data, params ) => {
			params.onSuccess?.();
		},
	} );
};

export default useSiteSubscribeMutation;
