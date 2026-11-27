import { wpcom } from '../wpcom-fetcher';

/**
 * Parameters sent to the logstash endpoint.
 * @see PCYsg-5T4-p2
 */
export interface LogToLogstashParams {
	/**
	 * Feature name.
	 *
	 * Should be explicitly allowed. @see D31385-code
	 */
	feature: 'calypso_ssr' | 'calypso_client';
	message: string;
	extra?: any;
	site_id?: number;
	tags?: string[];
	[ key: string ]: any;
}

/**
 * Log to logstash. This function is inefficient because
 * the data goes over the REST API, so use sparingly.
 * A log that can't be delivered (a network error, a 429 or a 5xx) is dropped; it only rejects when
 * the log itself is wrong: any other 4xx answer, or params that can't be serialized.
 */
export async function logToLogstash( params: LogToLogstashParams ): Promise< void > {
	const body = { params: JSON.stringify( params ) };
	try {
		await wpcom.req.post( '/logstash', body );
	} catch ( error ) {
		const status = ( error as { statusCode?: number } )?.statusCode;
		if ( status && status >= 400 && status < 500 && status !== 429 ) {
			throw error;
		}
	}
}
