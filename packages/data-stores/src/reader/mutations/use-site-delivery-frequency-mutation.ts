import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EmailDeliveryFrequency } from '../constants';
import { callApi, applyCallbackToPages } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import type { PagedQueryResult, SiteSubscription, SiteSubscriptionDetails } from '../types';

type SiteSubscriptionDeliveryFrequencyParams = {
	delivery_frequency: EmailDeliveryFrequency;
	blog_id: number | string;
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

const useSiteDeliveryFrequencyMutation = ( blog_id?: string ) => {
	const { isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();

	const siteSubscriptionsCacheKey = useCacheKey( [ 'read', 'site-subscriptions' ] );
	const siteSubscriptionDetailsCacheKey = useCacheKey( [
		'read',
		'site-subscription-details',
		...( blog_id ? [ blog_id ] : [] ),
	] );

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
		onMutate: async ( params ) => {
			await queryClient.cancelQueries( siteSubscriptionsCacheKey );
			await queryClient.cancelQueries( siteSubscriptionDetailsCacheKey );

			const previousSiteSubscriptions =
				queryClient.getQueryData< PagedQueryResult< SiteSubscription, 'subscriptions' > >(
					siteSubscriptionsCacheKey
				);
			const previousSiteSubscriptionDetails = queryClient.getQueryData< SiteSubscriptionDetails >(
				siteSubscriptionDetailsCacheKey
			);

			const mutatedSiteSubscriptions = applyCallbackToPages< 'subscriptions', SiteSubscription >(
				previousSiteSubscriptions,
				( page ) => ( {
					...page,
					subscriptions: page.subscriptions.map( ( siteSubscription ) => {
						if ( siteSubscription.blog_ID === params.blog_id ) {
							return {
								...siteSubscription,
								delivery_methods: {
									...siteSubscription.delivery_methods,
									email: {
										...( siteSubscription.delivery_methods?.email ?? { send_posts: false } ),
										post_delivery_frequency: params.delivery_frequency,
									},
								},
							};
						}
						return siteSubscription;
					} ),
				} )
			);
			queryClient.setQueryData( siteSubscriptionsCacheKey, mutatedSiteSubscriptions );

			if ( previousSiteSubscriptionDetails ) {
				queryClient.setQueryData( siteSubscriptionDetailsCacheKey, {
					...previousSiteSubscriptionDetails,
					delivery_methods: {
						...previousSiteSubscriptionDetails.delivery_methods,
						email: {
							...previousSiteSubscriptionDetails.delivery_methods?.email,
							post_delivery_frequency: params.delivery_frequency,
						},
					},
				} );
			}

			return { previousSiteSubscriptions, previousSiteSubscriptionDetails };
		},
		onError: ( err, params, context ) => {
			queryClient.setQueryData( siteSubscriptionsCacheKey, context?.previousSiteSubscriptions );
			queryClient.setQueryData(
				siteSubscriptionDetailsCacheKey,
				context?.previousSiteSubscriptionDetails
			);
		},
		onSettled: () => {
			// pass in a more minimal key, everything to the right will be invalidated
			queryClient.invalidateQueries( [ 'read', 'site-subscriptions' ] );
			queryClient.invalidateQueries( siteSubscriptionDetailsCacheKey );
		},
	} );
};

export default useSiteDeliveryFrequencyMutation;
