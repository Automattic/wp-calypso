import { fetchMeFlexUsage } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const meFlexUsageQuery = ( params: {
	start: number;
	end: number;
	resolution?: 'hour' | 'day' | 'month';
	forecast?: boolean;
	topN?: number;
	includeBySite?: boolean;
} ) =>
	queryOptions( {
		queryKey: [ 'me', 'flex-usage', params ],
		queryFn: () => fetchMeFlexUsage( params ),
	} );
