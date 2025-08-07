import { queryOptions, keepPreviousData } from '@tanstack/react-query';
import {
	fetchSiteLogs,
	SiteLogsAPIResponse,
	SiteLogsData,
	SiteLogsParams,
	PHPLog,
	ServerLog,
} from '../../data/site-logs';

export const siteLogsQuery = ( siteId: number, params: SiteLogsParams ) =>
	queryOptions< SiteLogsAPIResponse, unknown, SiteLogsData >( {
		queryKey: [
			'site',
			siteId,
			'logs',
			params.logType,
			params.start,
			params.end,
			JSON.stringify( params.filter ),
			params.sortOrder,
			params.pageSize,
			params.pageIndex,
		],
		queryFn: () =>
			fetchSiteLogs(
				siteId,
				params.logType,
				params.start,
				params.end,
				params.filter,
				params.sortOrder,
				params.pageSize,
				params.pageIndex
			),
		placeholderData: keepPreviousData,
		enabled: !! siteId && params.start <= params.end,
		staleTime: Infinity, // The logs within a specified time range never change.
		select: ( data: SiteLogsAPIResponse ) => ( {
			logs: Array.isArray( data.logs )
				? data.logs.map( ( log: PHPLog | ServerLog, key: number ) => ( {
						...log,
						id: String( key ),
				  } ) )
				: [],
			total_results:
				typeof data.total_results === 'number'
					? data.total_results
					: data.total_results?.value ?? 0,
		} ),
	} );
