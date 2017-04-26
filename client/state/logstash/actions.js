/**
 * Internal dependencies
 */
import { LOGSTASH } from 'state/action-types';

export function logToLogstash( params ) {
	return {
		type: LOGSTASH,
		params,
	};
}
