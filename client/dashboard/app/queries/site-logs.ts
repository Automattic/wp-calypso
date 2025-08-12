import { queryOptions } from '@tanstack/react-query';
import { fetchSiteLogs, SiteLogsParams } from '../../data/site-logs';

export const siteLogsQuery = ( siteId: number, params: SiteLogsParams ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'logs', params ],
		queryFn: () =>
			fetchSiteLogs( {
				...params,
				siteId,
			} ),
		enabled: params.start <= params.end,
		staleTime: Infinity, // The logs within a specified time range never change.
	} );
