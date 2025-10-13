import { fetchRazorpayConfiguration } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const razorpayConfigurationQuery = ( requestArgs?: { sandbox: boolean } ) =>
	queryOptions( {
		queryKey: [ 'me', 'razorpay-configuration', requestArgs ],
		queryFn: () => fetchRazorpayConfiguration( requestArgs ),
	} );
