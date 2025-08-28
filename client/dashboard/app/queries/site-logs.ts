import { queryOptions, keepPreviousData } from '@tanstack/react-query';
import { fetchSiteLogs, SiteLogsParams } from '../../data/site-logs';

export const siteLogsQuery = ( siteId: number, params: SiteLogsParams, scrollId: string | null ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'logs', params, 'scroll', scrollId ],
		queryFn: () => fetchSiteLogs( siteId, params, scrollId ?? undefined ),
		placeholderData: keepPreviousData,
		enabled: !! siteId && params.start <= params.end,
		staleTime: Infinity, // The logs within a specified time range never change.
	} );
