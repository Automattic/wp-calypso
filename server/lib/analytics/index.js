/**
 * External dependencies
 */
import http from 'http';

/**
 * Internal dependencies
 */
import {
	isStatsdAnalyticsAllowed,
	statsdUrl
} from '../../../client/lib/analytics/statsd';

const analytics = {
	statsd: {
		recordTiming: function( featureSlug, eventType, duration ) {
			if ( isStatsdAnalyticsAllowed() ) {
				const url = statsdUrl( featureSlug, eventType, duration );
				http.get( url );
			}
		}
	}
};
export default analytics;
