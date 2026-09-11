/**
 * Throwaway instrumentation for the DOTCOM-18530 double site creation investigation.
 * Every call lands in `window.__dsrTrace` with a monotonic timestamp and in the console.
 */
type TraceRecord = { t: number; label: string } & Record< string, unknown >;

declare global {
	interface Window {
		__dsrTrace?: TraceRecord[];
	}
}

export function dsrTrace( label: string, data: Record< string, unknown > = {} ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}
	const record: TraceRecord = { t: Math.round( performance.now() * 10 ) / 10, label, ...data };
	( window.__dsrTrace ??= [] ).push( record );
	// eslint-disable-next-line no-console
	console.log( '[dsr]', record.t, label, data );
}
