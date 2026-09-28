import { fetchEbanxConfiguration } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const ebanxConfigurationQuery = ( requestType: string ) =>
	queryOptions( {
		queryKey: [ 'me', 'ebanx-configuration', requestType ],
		queryFn: () => fetchEbanxConfiguration( requestType ),
	} );
