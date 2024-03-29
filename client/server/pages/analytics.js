import config from '@automattic/calypso-config';
import { throttle } from 'lodash';
import { logServerEvent } from 'calypso/lib/analytics/statsd-utils';

// Compute the number of milliseconds between each call to recordTiming
const THROTTLE_MILLIS = 1000 / config( 'statsd_analytics_response_time_max_logs_per_second' );

const logAnalyticsThrottled = throttle( ( { sectionName, duration, loggedIn, usedSSRHandler } ) => {
	const events = [
		// Basic per-section response time metric for backwards compatibility.
		{
			name: 'response_time',
			value: duration,
			type: 'timing',
			isLegacy: true,
		},
		// More granular response-time metric including SSR and auth status.
		{
			name: `response_time.${
				loggedIn ? 'logged-in' : 'logged-out'
			}.ssr_pipeline_${ usedSSRHandler }`,
			value: duration,
			type: 'timing',
		},
	];
	logServerEvent( sectionName, events );
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
			usedSSRHandler: !! usedSSRHandler, // Can be undefined.
			duration: Date.now() - startRenderTime,
			sectionName,
		} );
	} );

	next();
}
