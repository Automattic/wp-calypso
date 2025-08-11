import { queryOptions } from '@tanstack/react-query';
import {
	fetchSiteLogs,
	SiteLogsParams,
	PHPLogFromEndpoint,
	ServerLogFromEndpoint,
} from '../../data/site-logs';

export const siteLogsQuery = ( siteId: number, params: SiteLogsParams ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'logs', params ],
		queryFn: () =>
			fetchSiteLogs( {
				siteId,
				logType: params.logType,
				start: params.start,
				end: params.end,
				filter: params.filter,
				sortOrder: params.sortOrder,
				pageSize: params.pageSize,
				pageIndex: params.pageIndex,
			} ),
		enabled: params.start <= params.end,
		staleTime: Infinity, // The logs within a specified time range never change.
		select: ( data ) => ( {
			logs: Array.isArray( data.data.logs )
				? data.data.logs.map(
						( log: PHPLogFromEndpoint | ServerLogFromEndpoint, key: number ) => ( {
							...log,
							id: String( key ),
						} )
				  )
				: [],
			total_results:
				typeof data.data.total_results === 'number'
					? data.data.total_results
					: data.data.total_results?.value ?? 0,
		} ),
	} );
