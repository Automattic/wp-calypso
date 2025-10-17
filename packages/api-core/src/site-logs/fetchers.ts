import { wpcom } from '../wpcom-fetcher';
import {
	SiteLogsData,
	SiteLogsParams,
	LogType,
	FilterType,
	SiteLogsAPIResponse,
	PHPLog,
	ServerLog,
	SiteLogsBatch,
} from './types';

export async function fetchSiteLogs(
	siteId: number,
	{ logType, start, end, filter, sortOrder, pageSize }: SiteLogsParams,
	scrollId?: string
): Promise< SiteLogsData > {
	const logTypeFragment = logType === LogType.PHP ? 'error-logs' : 'logs';
	const path = `/sites/${ siteId }/hosting/${ logTypeFragment }`;

	const queryParams = {
		start,
		end,
		filter,
		sort_order: sortOrder,
		page_size: pageSize,
		scroll_id: scrollId,
	};

	// Remove undefined values from queryParams
	Object.keys( queryParams ).forEach(
		( key ) =>
			( queryParams as Record< string, unknown > )[ key ] === undefined &&
			delete ( queryParams as Record< string, unknown > )[ key ]
	);

	const response = await wpcom.req.get(
		{
			path,
			apiNamespace: 'wpcom/v2',
		},
		{ ...queryParams }
	);

	const { data } = response as SiteLogsAPIResponse;

	const totalResults =
		typeof data.total_results === 'number' ? data.total_results : data.total_results?.value ?? 0;

	const logs = Array.isArray( data.logs ) ? data.logs : [];

	return {
		total_results: totalResults,
		logs: logs as ( PHPLog | ServerLog )[],
		scroll_id: data.scroll_id,
	};
}

export async function fetchSiteLogsBatch(
	siteId: number,
	args: {
		logType: LogType;
		start: number;
		end: number;
		filter: FilterType;
		pageSize?: number;
		scrollId?: string | null;
	}
): Promise< SiteLogsBatch > {
	const { logType, start, end, filter, pageSize, scrollId } = args;
	const path = `/sites/${ siteId }/hosting/${ logType === LogType.PHP ? 'error-logs' : 'logs' }`;
	const queryParams = {
		start,
		end,
		filter,
		page_size: pageSize ?? 500,
		scroll_id: scrollId ?? null,
	};
	// Remove undefined values from queryParams
	Object.keys( queryParams ).forEach(
		( key ) =>
			( queryParams as Record< string, unknown > )[ key ] === undefined &&
			delete ( queryParams as Record< string, unknown > )[ key ]
	);
	const response = await wpcom.req.get( { path, apiNamespace: 'wpcom/v2' }, queryParams );
	const { data } = response as SiteLogsAPIResponse;
	const totalResults =
		typeof data.total_results === 'number' ? data.total_results : data.total_results?.value ?? 0;
	const scroll = ( data as Partial< { scroll_id: string | null } > ).scroll_id ?? null;
	return {
		logs: Array.isArray( data.logs ) ? data.logs : [],
		scroll_id: scroll,
		total_results: totalResults,
	};
}
