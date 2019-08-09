/**
 * Internal dependencies
 */
import { LOGSTASH } from 'state/action-types';
import 'state/data-layer/wpcom/logstash';

interface LogToLogstashParams {
	feature: string;
	message: string;
	extra?: any;
	site_id?: number;
	[key: string]: any;
}

/**
 * Log to logstash. This method is inefficient because
 * the data goes over the REST API, so use sparingly.
 *
 * @param params wpcom log2logstash params. @see PCYsg-5T4-p2
 * @returns      Action object
 */
export function logToLogstash( params: LogToLogstashParams ) {
	return {
		type: LOGSTASH,
		params: { params: JSON.stringify( params ) },
	};
}
