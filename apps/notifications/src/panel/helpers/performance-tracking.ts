import { cancel, start, stop } from '@automattic/browser-data-collector';

export type PerfReportName = 'notifications-panel-initial-fill' | 'notifications-panel-load-more';

// Reports go to Logstash unsampled once started, and the panel is one of the
// highest-traffic surfaces on WordPress.com — sample at start() to keep volume sane.
const SAMPLE_RATES: Record< PerfReportName, number > = {
	'notifications-panel-initial-fill': 0.01,
	'notifications-panel-load-more': 0.1,
};

/**
 * Start a sampled performance report. Fire-and-forget: perf tracking must
 * never throw and take down the surface it is trying to measure.
 */
export function startPerfReport( name: PerfReportName ) {
	try {
		if ( Math.random() >= SAMPLE_RATES[ name ] ) {
			return;
		}
		start( name, { fullPageLoad: false } )?.catch( () => {} );
	} catch {
		// Never let perf tracking crash the panel.
	}
}

/**
 * Stop a report and send it, attaching extra fields. A no-op when the report
 * was never started (sampled out).
 */
export function stopPerfReport(
	name: PerfReportName,
	data: Record< string, number | string | boolean > = {}
) {
	try {
		stop( name, {
			collectors: [
				( report ) => {
					Object.entries( data ).forEach( ( [ key, value ] ) => report.data.set( key, value ) );
					return report;
				},
			],
		} )?.catch( () => {} );
	} catch {
		// Never let perf tracking crash the panel.
	}
}

/**
 * Discard an in-flight report without sending it (e.g. the request failed).
 */
export function cancelPerfReport( name: PerfReportName ) {
	try {
		cancel( name );
	} catch {
		// Never let perf tracking crash the panel.
	}
}
