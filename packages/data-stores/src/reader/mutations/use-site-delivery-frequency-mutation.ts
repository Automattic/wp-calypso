import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EmailDeliveryFrequency } from '../constants';
import { callApi, applyCallbackToPages, buildQueryKey } from '../helpers';
import { alterSiteSubscriptionDetails } from '../helpers/optimistic-update';
import { useIsLoggedIn } from '../hooks';
import type {
	PagedQueryResult,
	SiteSubscriptionsResponseItem,
	SiteSubscriptionDetails,
} from '../types';

type SiteSubscriptionDeliveryFrequencyParams = {
	delivery_frequency: EmailDeliveryFrequency;
	blog_id: number | string;
	subscriptionId: number;
};

type SubscriptionResponse = {
	blog_ID: string;
	delivery_frequency: EmailDeliveryFrequency;
	status: string;
	ts: Date;
};

type SiteSubscriptionDeliveryFrequencyResponse = {
	success: boolean;
	subscribed: boolean;
	subscription: SubscriptionResponse | null;
};

const useSiteDeliveryFrequencyMutation = () => {
	const { id, isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: async ( params: SiteSubscriptionDeliveryFrequencyParams ) => {
			if ( ! params.blog_id || ! params.delivery_frequency ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while saving the delivery frequency.'
				);
			}

			const response = await callApi< SiteSubscriptionDeliveryFrequencyResponse >( {
				path: `/read/site/${ params.blog_id }/post_email_subscriptions/update`,
				method: 'POST',
				body: {
					delivery_frequency: params.delivery_frequency,
				},
				isLoggedIn,
				apiVersion: '1.2',
			} );
			if ( ! response.success ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while saving the delivery frequency.'
				);
			}

			return response;
		},
		onMutate: async ( { blog_id, delivery_frequency, subscriptionId } ) => {
			const siteSubscriptionsCacheKey = buildQueryKey(
				[ 'read', 'site-subscriptions' ],
				isLoggedIn,
				id
			);

			await queryClient.cancelQueries( siteSubscriptionsCacheKey );

			const previousSiteSubscriptions =
				queryClient.getQueryData<
					PagedQueryResult< SiteSubscriptionsResponseItem, 'subscriptions' >
				>( siteSubscriptionsCacheKey );
			const mutatedSiteSubscriptions = applyCallbackToPages<
				'subscriptions',
				SiteSubscriptionsResponseItem
			>( previousSiteSubscriptions, ( page ) => ( {
				...page,
				subscriptions: page.subscriptions.map( ( siteSubscription ) => {
					if ( siteSubscription.blog_ID === blog_id ) {
						return {
							...siteSubscription,
							delivery_methods: {
								...siteSubscription.delivery_methods,
								email: {
									...( siteSubscription.delivery_methods?.email ?? { send_posts: false } ),
									post_delivery_frequency: delivery_frequency,
								},
							},
						};
					}
					return siteSubscription;
				} ),
			} ) );
			queryClient.setQueryData( siteSubscriptionsCacheKey, mutatedSiteSubscriptions );

			const previousSiteSubscriptionDetails = await alterSiteSubscriptionDetails(
				queryClient,
				{ blogId: String( blog_id ), subscriptionId: String( subscriptionId ), isLoggedIn, id },
				( previousData ) => {
					return {
						...previousData,
						delivery_methods: {
							...previousData.delivery_methods,
							email: {
								...( previousData.delivery_methods?.email ?? { send_posts: false } ),
								post_delivery_frequency: delivery_frequency,
							},
						},
					} as SiteSubscriptionDetails;
				}
			);

			return {
				previousSiteSubscriptions,
				previousSiteSubscriptionDetails,
			};
		},
		onError: ( err, _, context ) => {
			queryClient.setQueryData(
				buildQueryKey( [ 'read', 'site-subscriptions' ], isLoggedIn, id ),
				context?.previousSiteSubscriptions
			);
			if ( context?.previousSiteSubscriptionDetails ) {
				for ( const { key, data } of context.previousSiteSubscriptionDetails ) {
					queryClient.setQueryData( key, data );
				}
			}
		},
		onSettled: ( _data, _err, { blog_id, subscriptionId } ) => {
			// pass in a more minimal key, everything to the right will be invalidated
			queryClient.invalidateQueries( [ 'read', 'site-subscriptions' ] );
			queryClient.invalidateQueries(
				buildQueryKey( [ 'read', 'site-subscription-details', String( blog_id ) ], isLoggedIn, id )
			);
			queryClient.invalidateQueries(
				buildQueryKey(
					[ 'read', 'site-subscription-details', '', String( subscriptionId ) ],
					isLoggedIn,
					id
				)
			);
			queryClient.invalidateQueries( [ 'read', 'subscriptions', subscriptionId, isLoggedIn, id ] );
		},
	} );
};

export default useSiteDeliveryFrequencyMutation;
