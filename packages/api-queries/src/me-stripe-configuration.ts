import { fetchStripeConfiguration } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const stripeConfigurationQuery = ( requestArgs?: {
	country?: string;
	payment_partner?: string;
} ) =>
	queryOptions( {
		queryKey: [ 'me', 'stripe-configuration', requestArgs ],
		queryFn: () => fetchStripeConfiguration( requestArgs ),
	} );
