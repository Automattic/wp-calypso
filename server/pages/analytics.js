/**
 * Internal dependencies
 */
import analytics from '../lib/analytics';

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
			analytics.statsd.recordTiming(
				req.context.sectionName,
				'response-time',
				duration
			);
		}
	} );

	next();
}
