/**
 * Internal dependencies
 */
import { LOGSTASH } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/logstash';

/**
 * Parameters sent to logstash endpoint.
 *
 * @see PCYsg-5T4-p2
 */
interface LogToLogstashParams {
	/**
	 * Feature name.
	 *
	 * Should be explicitly allowed. @see D31385-code
	 */
	feature: 'calypso_ssr' | 'calypso_client';
	message: string;
	extra?: any;
	site_id?: number;
	[ key: string ]: any;
}

/**
 * Log to logstash. This method is inefficient because
 * the data goes over the REST API, so use sparingly.
 *
 * @param params wpcom log2logstash params.
 * @returns      Action object
 */
export function logToLogstash( params: LogToLogstashParams ) {
	return {
		type: LOGSTASH,
		params: { params: JSON.stringify( params ) },
	};
}
