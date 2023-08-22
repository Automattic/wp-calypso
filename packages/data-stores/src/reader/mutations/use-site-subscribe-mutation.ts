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
	onError?: () => void;
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

const buildSubscriptionDetailsCacheKey = (
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
			let previousSiteSubscriptionDetails: SiteSubscriptionDetails | undefined;

			if ( isValidBlogId ) {
				const siteSubscriptionDetailsCacheKey = buildSubscriptionDetailsCacheKey(
					String( params.blog_id ),
					isLoggedIn,
					userId
				);
				await queryClient.cancelQueries( siteSubscriptionDetailsCacheKey );

				previousSiteSubscriptionDetails = queryClient.getQueryData< SiteSubscriptionDetails >(
					siteSubscriptionDetailsCacheKey
				);

				if ( previousSiteSubscriptionDetails ) {
					queryClient.setQueryData( siteSubscriptionDetailsCacheKey, {
						...previousSiteSubscriptionDetails,
						subscriber_count: previousSiteSubscriptionDetails.subscriber_count + 1,
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
									siteSubscription.blog_ID === params.blog_id ? false : siteSubscription.isDeleted,
								date_subscribed:
									siteSubscription.blog_ID === params.blog_id
										? new Date()
										: siteSubscription.date_subscribed,
							} ) ),
						};
					} ),
				} );
			}

			return { previousSiteSubscriptions, previousSiteSubscriptionDetails };
		},
		onError: ( error, params, context ) => {
			if ( context?.previousSiteSubscriptions ) {
				queryClient.setQueryData( siteSubscriptionsCacheKey, context.previousSiteSubscriptions );
			}

			if ( isValidId( params.blog_id ) && context?.previousSiteSubscriptionDetails ) {
				const siteSubscriptionDetailsCacheKey = buildSubscriptionDetailsCacheKey(
					String( params.blog_id ),
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

			if ( isValidId( params.blog_id ) ) {
				const siteSubscriptionDetailsCacheKey = buildSubscriptionDetailsCacheKey(
					String( params.blog_id ),
					isLoggedIn,
					userId
				);
				queryClient.invalidateQueries( siteSubscriptionDetailsCacheKey );
				queryClient.invalidateQueries( [ 'read', 'sites', Number( params.blog_id ) ] );
			}

			if ( isValidId( params.feed_id ) ) {
				const feedCacheKey = [ 'read', 'feeds', Number( params.feed_id ) ];
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
