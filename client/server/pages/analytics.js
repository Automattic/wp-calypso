import config from '@automattic/calypso-config';
import { throttle } from 'lodash';
import analytics from '../lib/analytics';

// Compute the number of milliseconds between each call to recordTiming
const THROTTLE_MILLIS = 1000 / config( 'statsd_analytics_response_time_max_logs_per_second' );

const logAnalyticsThrottled = throttle( ( { sectionName, duration, loggedIn, usedSSRHandler } ) => {
	const events = [
		// Basic per-section response time metric for backwards compatibility.
		{
			name: 'response_time',
			value: duration,
			type: 'timing',
		},
		// More granular response-time metric including SSR and auth status.
		{
			name: `loggedin_${ loggedIn }.ssr_${ usedSSRHandler }.response_time`,
			value: duration,
			type: 'timing',
		},
	];
	analytics.statsd.recordEvents( sectionName, events );
}, THROTTLE_MILLIS );

/*
 * Middleware to log the response time of the node request for a section.
 * Only logs if the request context contains a `sectionName` attribute.
 */
export function logSectionResponse( req, res, next ) {
	const startRenderTime = Date.now();

	res.on( 'close', function () {
		if ( ! req.context?.sectionName ) {
			return;
		}
		const { user, sectionName, usedSSRHandler } = req.context;

		logAnalyticsThrottled( {
			loggedIn: !! user,
			usedSSRHandler: !! usedSSRHandler, // Convert undefined to false
			duration: Date.now() - startRenderTime,
			sectionName,
		} );
	} );

	next();
}
