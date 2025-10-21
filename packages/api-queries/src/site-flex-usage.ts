import { fetchSiteFlexUsage } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteFlexUsageQuery = (
	siteId: number,
	params: { start: number; end: number; resolution?: 'hour' | 'day' | 'month'; forecast?: boolean }
) =>
	queryOptions( {
		queryKey: [ 'sites', siteId, 'flex-usage', params ],
		queryFn: () => fetchSiteFlexUsage( siteId, params ),
	} );
