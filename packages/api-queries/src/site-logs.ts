import { fetchSiteLogs, SiteLogsParams, fetchSiteActivityLog } from '@automattic/api-core';
import { queryOptions, keepPreviousData } from '@tanstack/react-query';

export const siteLogsQuery = ( siteId: number, params: SiteLogsParams, scrollId: string | null ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'logs', params, 'scroll', scrollId ],
		queryFn: () => fetchSiteLogs( siteId, params, scrollId ?? undefined ),
		placeholderData: keepPreviousData,
		enabled: params.start <= params.end,
		staleTime: Infinity, // The logs within a specified time range never change.
	} );

export const siteActivityLogQuery = ( siteId: number, number: number = 50 ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'activity-log', number ],
		queryFn: () => fetchSiteActivityLog( siteId, { number } ),
		placeholderData: keepPreviousData,
	} );
