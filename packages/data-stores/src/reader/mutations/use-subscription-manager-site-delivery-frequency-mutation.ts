import { useMutation, useQueryClient } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import type { SiteSubscriptionDeliveryFrequency } from '../types';

type SiteSubscriptionDeliveryFrequencyParams = {
	delivery_frequency: SiteSubscriptionDeliveryFrequency;
	blog_id: number | string;
};

type SubscriptionResponse = {
	blog_ID: string;
	delivery_frequency: SiteSubscriptionDeliveryFrequency;
	status: string;
	ts: Date;
};

type SiteSubscriptionDeliveryFrequencyResponse = {
	success: boolean;
	subscribed: boolean;
	subscription: SubscriptionResponse | null;
};

const useSubscriptionManagerSiteDeliveryFrequencyMutation = () => {
	const isLoggedIn = useIsLoggedIn();
	const queryClient = useQueryClient();
	return useMutation(
		async ( params: SiteSubscriptionDeliveryFrequencyParams ) => {
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
		{
			onSuccess: () => {
				queryClient.invalidateQueries( [ 'read', 'site-subscriptions', isLoggedIn ] );
			},
		}
	);
};

export { useSubscriptionManagerSiteDeliveryFrequencyMutation };
