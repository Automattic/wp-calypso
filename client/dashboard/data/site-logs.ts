import wpcom from 'calypso/lib/wp';

export interface SiteLogsAPIResponse {
	message: string;
	data: {
		total_results: number | { value: number; relation: string };
		logs: ( PHPLogFromEndpoint | ServerLogFromEndpoint )[];
	};
}

export interface PHPLogFromEndpoint {
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

export enum LogType {
	PHP = 'php',
	SERVER = 'server',
}

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
	siteId: number | null | undefined;
	logType: LogType;
	start: number;
	end: number;
	filter: FilterType;
	sortOrder?: string;
	pageSize?: number;
	pageIndex?: number;
}

export async function fetchSiteLogs( {
	siteId,
	logType,
	start,
	end,
	filter,
	sortOrder,
	pageSize,
	pageIndex,
}: SiteLogsParams ): Promise< SiteLogsAPIResponse > {
	const logTypeFragment = logType === LogType.PHP ? 'error-logs' : 'logs';
	const path = `/sites/${ siteId }/hosting/${ logTypeFragment }`;

	const queryParams = {
		start: start,
		end: end,
		filter: filter,
		sort_order: sortOrder,
		page_size: pageSize,
		page_index: pageIndex,
	};

	// Remove undefined values from queryParams
	Object.keys( queryParams ).forEach(
		( key ) =>
			( queryParams as Record< string, unknown > )[ key ] === undefined &&
			delete ( queryParams as Record< string, unknown > )[ key ]
	);

	const logs = await wpcom.req.get(
		{
			path,
			apiNamespace: 'wpcom/v2',
		},
		{ ...queryParams }
	);

	return logs;
}
