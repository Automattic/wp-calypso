declare global {
	interface NavigatorConnection {
		rtt?: number;
		downlink?: number;
		effectiveType?: string;
	}

	interface Navigator {
		connection?: NavigatorConnection;
	}
}

interface WebVitalsProps {
	perf_ttfb?: number;
	perf_fcp?: number;
	perf_lcp?: number;
	perf_cls?: number;
	net_rtt?: number;
	net_downlink?: number;
}

const vitals: WebVitalsProps = {};
let initialized = false;

function collectNavigationMetrics(): void {
	const [ nav ] = performance.getEntriesByType( 'navigation' ) as PerformanceNavigationTiming[];
	if ( nav ) {
		vitals.perf_ttfb = Math.round( nav.responseStart );
	}

	const fcp = performance
		.getEntriesByType( 'paint' )
		.find( ( e ) => e.name === 'first-contentful-paint' );
	if ( fcp ) {
		vitals.perf_fcp = Math.round( fcp.startTime );
	}
}

function observeLCP(): void {
	new PerformanceObserver( ( list ) => {
		const entries = list.getEntries();
		const last = entries[ entries.length - 1 ];
		if ( last ) {
			vitals.perf_lcp = Math.round( last.startTime );
		}
	} ).observe( { type: 'largest-contentful-paint', buffered: true } );
}

function observeCLS(): void {
	let clsValue = 0;
	new PerformanceObserver( ( list ) => {
		for ( const entry of list.getEntries() as ( PerformanceEntry & {
			hadRecentInput: boolean;
			value: number;
		} )[] ) {
			if ( ! entry.hadRecentInput ) {
				clsValue += entry.value;
			}
		}
		vitals.perf_cls = Math.round( clsValue * 1000 ) / 1000;
	} ).observe( { type: 'layout-shift', buffered: true } );
}

function snapshotConnection(): void {
	const conn = navigator.connection;
	if ( ! conn ) {
		return;
	}
	if ( typeof conn.rtt === 'number' ) {
		vitals.net_rtt = conn.rtt;
	}
	if ( typeof conn.downlink === 'number' ) {
		vitals.net_downlink = conn.downlink;
	}
}

function init(): void {
	if ( initialized || typeof window === 'undefined' ) {
		return;
	}
	initialized = true;

	try {
		collectNavigationMetrics();
	} catch {
		// Navigation/Paint Timing not supported.
	}

	if ( typeof PerformanceObserver !== 'undefined' ) {
		try {
			observeLCP();
		} catch {
			// LCP observation not supported.
		}
		try {
			observeCLS();
		} catch {
			// Layout Shift observation not supported.
		}
	}

	try {
		snapshotConnection();
	} catch {
		// Network Information API not supported.
	}
}

/**
 * Lazily initializes Performance Observer collectors on first call and
 * returns the current snapshot of web-vital metrics plus connection info.
 *
 * Safe to call during SSR — returns an empty object on the server.
 * Values populate progressively: TTFB and FCP are available immediately,
 * LCP and CLS arrive via observers and update the same cached object,
 * so every subsequent event gets the latest readings.
 */
export function getWebVitalsProps(): WebVitalsProps {
	return vitals;
}

init();
