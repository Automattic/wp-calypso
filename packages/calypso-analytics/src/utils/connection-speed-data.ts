declare global {
	interface NavigatorConnection {
		rtt?: number;
		downlink?: number;
	}

	interface Navigator {
		connection?: NavigatorConnection;
	}
}

interface ConnectionProps {
	net_rtt?: number;
	net_rtt_connection?: number;
	net_rtt_estimated?: number;
	net_downlink?: number;
}

const props: ConnectionProps = {};
let initialized = false;

/**
 * Approximates RTT from Navigation Timing when the Network Information API
 * is unavailable (Firefox, Safari).  Uses `responseStart − requestStart`
 * which includes server processing time, so it over-estimates slightly.
 * Tries the Level 2 PerformanceNavigationTiming entry first, then falls
 * back to the deprecated Level 1 `performance.timing` object.
 */
function estimateRttFromNavTiming(): number | undefined {
	const navEntries = performance.getEntriesByType( 'navigation' ) as PerformanceNavigationTiming[];
	if ( navEntries.length && navEntries[ 0 ].requestStart > 0 ) {
		return Math.round( navEntries[ 0 ].responseStart - navEntries[ 0 ].requestStart );
	}

	// Navigation Timing Level 1 fallback (deprecated but widely supported).
	const timing = performance.timing;
	if ( timing && timing.requestStart > 0 ) {
		return Math.round( timing.responseStart - timing.requestStart );
	}

	return undefined;
}

function init(): void {
	if ( initialized || typeof window === 'undefined' ) {
		return;
	}
	initialized = true;

	try {
		const conn = navigator.connection;
		if ( conn ) {
			if ( typeof conn.rtt === 'number' ) {
				props.net_rtt_connection = conn.rtt;
			}
			if ( typeof conn.downlink === 'number' ) {
				props.net_downlink = conn.downlink;
			}
		}

		props.net_rtt_estimated = estimateRttFromNavTiming();
		props.net_rtt = props.net_rtt_connection ?? props.net_rtt_estimated;
	} catch {
		// Network / Navigation Timing APIs not supported.
	}
}

/**
 * Returns cached connection quality metrics.
 *
 * Collected eagerly at module load (guarded by `typeof window` so SSR
 * gets an empty object).
 *
 * - `net_rtt_connection`  — from `navigator.connection.rtt` (Chromium only)
 * - `net_rtt_estimated`   — approximated from Navigation Timing
 * - `net_rtt`             — whichever is available, connection preferred
 * - `net_downlink`        — from `navigator.connection.downlink`
 */
export function getConnectionSpeedData(): ConnectionProps {
	return props;
}

init();
