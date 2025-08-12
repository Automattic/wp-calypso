import wpcom from 'calypso/lib/wp';

interface SiteLogsAPIResponse {
	message: string;
	data: {
		total_results: number | { value: number; relation: string };
		logs: ( PHPLogFromEndpoint | ServerLogFromEndpoint )[];
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
	pageIndex?: number;
}

export interface SiteLogsData {
	total_results: number;
	logs: ( PHPLog | ServerLog )[];
}

export async function fetchSiteLogs(
	siteId: number,
	{ logType, start, end, filter, sortOrder, pageSize, pageIndex }: SiteLogsParams
): Promise< SiteLogsData > {
	const logTypeFragment = logType === LogType.PHP ? 'error-logs' : 'logs';
	const path = `/sites/${ siteId }/hosting/${ logTypeFragment }`;

	const queryParams = {
		start,
		end,
		filter,
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

	if ( logType === LogType.PHP ) {
		const normalized = ( logs as PHPLogFromEndpoint[] ).map(
			( { atomic_site_id, ...logWithoutAtomicId }, index ) => ( {
				...logWithoutAtomicId,
				id: `${ logWithoutAtomicId.timestamp }|${ logWithoutAtomicId.file }|${ String(
					logWithoutAtomicId.line
				) }|${ String( pageIndex ?? 0 ) }|${ String( index ) }`,
			} )
		);
		return { total_results: totalResults, logs: normalized };
	}

	const normalized = ( logs as ServerLogFromEndpoint[] ).map( ( log, index ) => ( {
		...log,
		id: `${ String( log.timestamp ) }|${ log.request_type }|${ log.status }|${ log.request_url }|${
			log.user_ip
		}|${ String( pageIndex ?? 0 ) }|${ String( index ) }`,
	} ) );
	return { total_results: totalResults, logs: normalized };
}
