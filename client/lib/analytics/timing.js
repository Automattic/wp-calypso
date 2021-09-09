import { getMostRecentUrlPath } from '@automattic/calypso-analytics';
import { gaRecordTiming } from './ga';
import { statsdRecordTiming } from './statsd';

export function recordTiming( eventType, duration, triggerName ) {
	const urlPath = getMostRecentUrlPath() || 'unknown';
	gaRecordTiming( urlPath, eventType, duration, triggerName );
	statsdRecordTiming( urlPath, eventType, duration, triggerName );
}
