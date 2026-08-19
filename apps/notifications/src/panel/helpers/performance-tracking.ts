import { cancel, start, stop } from '@automattic/browser-data-collector';

export type PerfReportName = 'notifications-panel-initial-fill' | 'notifications-panel-load-more';

// Reports go to Logstash unsampled once started, and the panel is one of the
// highest-traffic surfaces on WordPress.com — sample at start() to keep volume sane.
const SAMPLE_RATES: Record< PerfReportName, number > = {
	'notifications-panel-initial-fill': 0.01,
	'notifications-panel-load-more': 0.1,
};

// The collector keys in-flight reports by name in a global map, and stops are
// deferred to the next frame — so consecutive same-name requests can overlap by
// a frame. Track which names this module has active, and when each started, so
// a deferred stop can never land on a successor request's report.
const activeSince = new Map< PerfReportName, number >();

// A report whose stop never ran (e.g. its requestAnimationFrame in a tab that
// was hidden and never shown again) would block its name for the whole session;
// treat it as abandoned after this long.
const STALE_MS = 30_000;

/**
 * Start a sampled performance report. Fire-and-forget: perf tracking must
 * never throw and take down the surface it is trying to measure.
 * @returns whether a report was started; pass any stop for this request
 * through that flag, so a sampled-out request can't stop a neighbor's report.
 */
export function startPerfReport( name: PerfReportName ): boolean {
	try {
		const startedAt = activeSince.get( name );
		if ( startedAt !== undefined ) {
			if ( Date.now() - startedAt < STALE_MS ) {
				return false;
			}
			cancel( name );
			activeSince.delete( name );
		}
		if ( Math.random() >= SAMPLE_RATES[ name ] ) {
			return false;
		}
		activeSince.set( name, Date.now() );
		start( name, { fullPageLoad: false } ).catch( () => {} );
		return true;
	} catch {
		// Never let perf tracking crash the panel.
		return false;
	}
}

/**
 * Stop the active report and send it, attaching extra fields. A no-op when no
 * report of this name is active.
 */
export function stopPerfReport(
	name: PerfReportName,
	data: Record< string, number | string | boolean > = {}
) {
	try {
		if ( ! activeSince.has( name ) ) {
			return;
		}
		activeSince.delete( name );
		stop( name, {
			collectors: [
				( report ) => {
					Object.entries( data ).forEach( ( [ key, value ] ) => report.data.set( key, value ) );
					return report;
				},
			],
		} ).catch( () => {} );
	} catch {
		// Never let perf tracking crash the panel.
	}
}
