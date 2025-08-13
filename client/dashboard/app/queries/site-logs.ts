import { queryOptions, keepPreviousData } from '@tanstack/react-query';
import { fetchSiteLogs, SiteLogsParams, SiteLogsQueryOptions } from '../../data/site-logs';

export const siteLogsQuery = (
	siteId: number,
	params: SiteLogsParams,
	options?: SiteLogsQueryOptions
) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'logs', params ],
		queryFn: () => fetchSiteLogs( siteId, params ),
		placeholderData: options?.keepPreviousData ? keepPreviousData : undefined,
		enabled: params.start <= params.end,
		staleTime: Infinity, // The logs within a specified time range never change.
	} );
