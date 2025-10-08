import { fetchFlexUsage, type FlexUsageResponse } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export type { FlexUsageResponse };

export const flexUsageQuery = (
	siteId: number,
	params: { start: number; end: number; resolution?: 'hour' | 'day' | 'month'; forecast?: boolean }
) =>
	queryOptions( {
		queryKey: [ 'sites', siteId, 'flex-usage', params ],
		queryFn: () => fetchFlexUsage( siteId, params ),
	} );
