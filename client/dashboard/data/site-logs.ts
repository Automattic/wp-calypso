import wpcom from 'calypso/lib/wp';

interface SiteLogsAPIResponse {
	message: string;
	data: {
		total_results: number | { value: number; relation: string };
		logs: ( PHPLogFromEndpoint | ServerLogFromEndpoint )[];
		scroll_id: string | null;
	};
}

interface PHPLogFromEndpoint {
	timestamp: string;
	severity: 'User' | 'Warning' | 'Deprecated' | 'Fatal error';
	message: string;
	kind: string;
	name: string;
	file: string;
	line: number;
	atomic_site_id: number;
}

export interface PHPLog extends Omit< PHPLogFromEndpoint, 'atomic_site_id' > {
	id: string;
}

export type SiteLogsQueryOptions = { keepPreviousData?: boolean };

export const LogType = {
	PHP: 'php',
	SERVER: 'server',
} as const;

export type LogType = ( typeof LogType )[ keyof typeof LogType ];

export interface FilterType {
	[ key: string ]: Array< string >;
}

export interface ServerLogFromEndpoint {
	date: string;
	request_type: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE';
	status: '200' | '301' | '302' | '400' | '401' | '403' | '404' | '429' | '500';
	request_url: string;
	body_bytes_sent: number;
	cached: string;
	http_host: string;
	http_referer: string;
	http2: string;
	http_user_agent: string;
	http_version: string;
	http_x_forwarded_for: string;
	renderer: string;
	request_completion: string;
	request_time: string;
	scheme: string;
	timestamp: number;
	type: string;
	user_ip: string;
}

export interface ServerLog extends ServerLogFromEndpoint {
	id: string;
}

export interface SiteLogsParams {
	logType: LogType;
	start: number;
	end: number;
	filter: FilterType;
	sortOrder?: 'asc' | 'desc';
	pageSize?: number;
}

export interface SiteLogsData {
	total_results: number;
	logs: ( PHPLog | ServerLog )[];
	scroll_id: string | null;
}

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

export interface SiteLogsBatch {
	logs: ( PHPLogFromEndpoint | ServerLogFromEndpoint )[];
	scroll_id: string | null;
	total_results: number;
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
