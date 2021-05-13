/**
 * Internal dependencies
 */
import { gaRecordTiming } from './ga';
import { statsdRecordTiming } from './statsd';
import { getMostRecentUrlPath } from '@automattic/calypso-analytics';

export function recordTiming( eventType, duration, triggerName ) {
	const urlPath = getMostRecentUrlPath() || 'unknown';
	gaRecordTiming( urlPath, eventType, duration, triggerName );
	statsdRecordTiming( urlPath, eventType, duration, triggerName );
}
