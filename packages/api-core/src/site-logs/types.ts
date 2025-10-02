export interface SiteLogsAPIResponse {
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

export const LogType = {
	PHP: 'php',
	SERVER: 'server',
	ACTIVITY: 'activity',
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

export interface SiteLogsBatch {
	logs: ( PHPLogFromEndpoint | ServerLogFromEndpoint )[];
	scroll_id: string | null;
	total_results: number;
}
