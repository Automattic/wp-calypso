/** @format */

/**
 * Internal dependencies
 */
import { LOGSTASH } from 'state/action-types';

import 'state/data-layer/wpcom/logstash';

/**
 * Log to logstash. This method is inefficient because
 * the data goes over the REST API, so use sparingly.
 *
 * @param {Object} params same as wpcom log2logstash params arg
 * @returns {Object} Action object
 */
export function logToLogstash( params ) {
	return {
		type: LOGSTASH,
		params: { params: JSON.stringify( params ) },
	};
}
