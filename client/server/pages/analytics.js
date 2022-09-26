import config from '@automattic/calypso-config';
import { throttle } from 'lodash';
import analytics from '../lib/analytics';

// Compute the number of milliseconds between each call to recordTiming
const THROTTLE_MILLIS = 1000 / config( 'statsd_analytics_response_time_max_logs_per_second' );

const logAnalyticsThrottled = throttle(
	( { sectionName, target, duration, loggedIn, usedSSRHandler } ) => {
		const events = [
			// Basic per-section response time metric for backwards compatibility.
			{
				name: 'response_time',
				value: duration,
				type: 'timing',
			},
			// More granular response-time metric including SSR and auth status.
			{
				name: `response_time.loggedin_${ loggedIn }.ssr_${ usedSSRHandler }`,
				value: duration,
				type: 'timing',
			},
		];
		if ( target ) {
			events.push( {
				name: `target.${ target }`,
				type: 'counting',
			} );
		}
		analytics.statsd.recordEvents( sectionName, events );
	},
	THROTTLE_MILLIS
);

/*
 * Middleware to log the response time of the node request for a
 * section, as well as which build target was served.
 * Only logs if the request context contains a `sectionName` attribute.
 */
export function logSectionResponse( req, res, next ) {
	const startRenderTime = Date().now();

	res.on( 'close', function () {
		if ( ! req.context?.sectionName ) {
			return;
		}
		const { user, sectionName, target, usedSSRHandler } = req.context;

		logAnalyticsThrottled( {
			loggedIn: !! user,
			usedSSRHandler: !! usedSSRHandler, // Convert undefined to false
			duration: Date().now() - startRenderTime,
			sectionName,
			target,
		} );
	} );

	next();
}
