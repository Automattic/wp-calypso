/**
 * External dependencies
 */
import superagent from 'superagent';

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
				superagent.get( url ).end();
			}
		}
	}
};
export default analytics;
