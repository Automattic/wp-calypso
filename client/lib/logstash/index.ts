import wpcom from 'calypso/lib/wp';

/**
 * Parameters sent to logstash endpoint.
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
	tags?: string[];
	[ key: string ]: any;
}

/**
 * Log to logstash. This function is inefficient because
 * the data goes over the REST API, so use sparingly.
 */
export async function logToLogstash( params: LogToLogstashParams ): Promise< void > {
	await wpcom.req.post( '/logstash', { params: JSON.stringify( params ) } );
}
