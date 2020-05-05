/**
 * External dependencies
 */
import debug from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import { statsdTimingUrl, statsdCountingUrl } from 'lib/analytics/statsd-utils';
import { getFeatureSlugFromPageUrl } from './feature-slug';

/**
 * Module variables
 */
const statsdDebug = debug( 'calypso:analytics:statsd' );

export function statsdRecordTiming( pageUrl, eventType, duration ) {
	if ( config( 'boom_analytics_enabled' ) ) {
		const featureSlug = getFeatureSlugFromPageUrl( pageUrl );

		statsdDebug(
			`Recording timing: path=${ featureSlug } event=${ eventType } duration=${ duration }ms`
		);

		const imgUrl = statsdTimingUrl( featureSlug, eventType, duration );
		new window.Image().src = imgUrl;
	}
}

export function statsdRecordCounting( pageUrl, eventType, increment = 1 ) {
	if ( config( 'boom_analytics_enabled' ) ) {
		const featureSlug = getFeatureSlugFromPageUrl( pageUrl );

		statsdDebug(
			`Recording counting: path=${ featureSlug } event=${ eventType } increment=${ increment }`
		);

		const imgUrl = statsdCountingUrl( featureSlug, eventType, increment );
		new window.Image().src = imgUrl;
	}
}
