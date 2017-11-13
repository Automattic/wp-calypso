/** @format */
/**
 * External dependencies
 */

import { throttle } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import analytics from '../lib/analytics';

// Compute the number of milliseconds between each call to recordTiming
const THROTTLE_MILLIS = 1000 / config( 'statsd_analytics_response_time_max_logs_per_second' );

const logAnalyticsThrottled = throttle( function( sectionName, duration ) {
	analytics.statsd.recordTiming( sectionName, 'response-time', duration );
}, THROTTLE_MILLIS );

/*
 * Middleware to log the response time of the node request for a
 * section. Only logs if the request context contains a
 * `sectionName` attribute.
 */
export function logSectionResponseTime( req, res, next ) {
	const startRenderTime = new Date();

	res.on( 'finish', function() {
		const context = req.context || {};
		if ( context.sectionName ) {
			const duration = new Date() - startRenderTime;
			logAnalyticsThrottled( context.sectionName, duration );
		}
	} );

	next();
}
