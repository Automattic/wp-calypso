export type LogType = 'php' | 'web';

export interface ServerLog {
	body_bytes_sent: number;
	cached: string;
	date: string;
	http_host: string;
	http_referer: string;
	request_type: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE';
	request_url: string;
	status: '200' | '301' | '302' | '400' | '401' | '403' | '404' | '429' | '500';
	timestamp: number;
}

export interface PHPLog {
	atomic_site_id: number;
	file: string;
	kind: string;
	line: number;
	message: string;
	name: string;
	severity: 'User' | 'Warning' | 'Deprecated' | 'Fatal error';
	timestamp: string;
}
