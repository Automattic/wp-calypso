/**
 * External dependencies
 */
import superagent from 'superagent';

/**
 * Internal dependencies
 */
import config from 'config';
import { statsdTimingUrl } from '../../../client/lib/analytics/statsd';

const analytics = {
	statsd: {
		recordTiming: function( featureSlug, eventType, duration ) {
			if ( config( 'server_side_boom_analytics_enabled' ) ) {
				const url = statsdTimingUrl( featureSlug, eventType, duration );
				superagent.get( url ).end();
			}
		}
	}
};
export default analytics;
