import type { Collector } from '../types';

// Types not yet in TS DOM lib
interface LayoutShiftEntry extends PerformanceEntry {
	hadRecentInput: boolean;
	value: number;
}

interface EventTimingEntry extends PerformanceEntry {
	interactionId: number;
	duration: number;
}

// Module-level state — assumes single concurrent report (same as page-visibility.ts)
let lcpValue = 0;
let clsValue = 0;
let clsSessionValue = 0;
let clsSessionFirstTime = 0;
let clsSessionLastTime = 0;
let inpInteractions: Map< number, number > = new Map();

let lcpObserver: PerformanceObserver | null = null;
let clsObserver: PerformanceObserver | null = null;
let inpObserver: PerformanceObserver | null = null;

function tryObserve(
	type: string,
	callback: ( entries: PerformanceEntryList ) => void,
	extraOptions: Record< string, unknown > = {}
) {
	try {
		const observer = new PerformanceObserver( ( list ) => callback( list.getEntries() ) );
		observer.observe( { type, buffered: true, ...extraOptions } as PerformanceObserverInit );
		return observer;
	} catch {
		return null;
	}
}

export const collectorStart: Collector = ( report ) => {
	lcpValue = 0;
	clsValue = 0;
	clsSessionValue = 0;
	clsSessionFirstTime = 0;
	clsSessionLastTime = 0;
	inpInteractions = new Map();

	lcpObserver = tryObserve( 'largest-contentful-paint', ( entries ) => {
		const last = entries[ entries.length - 1 ] as LargestContentfulPaint;
		if ( last ) {
			lcpValue = last.startTime;
		}
	} );

	// CLS session window algorithm: gap < 1s, window < 5s, track max session score
	clsObserver = tryObserve( 'layout-shift', ( entries ) => {
		for ( const entry of entries ) {
			const shift = entry as LayoutShiftEntry;
			if ( shift.hadRecentInput ) {
				continue;
			}

			if (
				shift.startTime - clsSessionLastTime >= 1000 ||
				shift.startTime - clsSessionFirstTime >= 5000
			) {
				// New session
				clsSessionValue = shift.value;
				clsSessionFirstTime = shift.startTime;
			} else {
				clsSessionValue += shift.value;
			}

			clsSessionLastTime = shift.startTime;

			if ( clsSessionValue > clsValue ) {
				clsValue = clsSessionValue;
			}
		}
	} );

	inpObserver = tryObserve(
		'event',
		( entries ) => {
			for ( const entry of entries ) {
				const event = entry as EventTimingEntry;
				if ( ! event.interactionId ) {
					continue;
				}
				const existing = inpInteractions.get( event.interactionId ) ?? 0;
				if ( event.duration > existing ) {
					inpInteractions.set( event.interactionId, event.duration );
				}
			}
		},
		{ durationThreshold: 16 }
	);

	return report;
};

export const collectorStop: Collector = ( report ) => {
	lcpObserver?.disconnect();
	clsObserver?.disconnect();
	inpObserver?.disconnect();
	lcpObserver = null;
	clsObserver = null;
	inpObserver = null;

	// LCP is a timestamp relative to navigation start — normalize like other timing values
	if ( lcpValue > 0 ) {
		const navigationStart = performance.timing?.navigationStart ?? report.beginning;
		report.data.set( 'lcp', lcpValue + navigationStart - report.beginning );
	}

	report.data.set( 'cls', clsValue );

	// INP = p98 of interaction durations
	const durations = Array.from( inpInteractions.values() ).sort( ( a, b ) => b - a );
	if ( durations.length > 0 ) {
		const idx = Math.min( Math.floor( durations.length / 50 ), durations.length - 1 );
		report.data.set( 'inp', durations[ idx ] );
	} else {
		report.data.set( 'inp', 0 );
	}

	// Reset state
	lcpValue = 0;
	clsValue = 0;
	clsSessionValue = 0;
	clsSessionFirstTime = 0;
	clsSessionLastTime = 0;
	inpInteractions = new Map();

	return report;
};
