import { useEffect, useState } from 'react';

interface Countdown {
	remainingMs: number;
	totalMs: number;
	hasExpired: boolean;
}

/**
 * Counts down from now to `expiresUnixSeconds`.
 *
 * The total duration is anchored at the moment this hook first sees a
 * defined `expiresUnixSeconds` (so the bar starts full). Time elapsed since
 * then is measured with `performance.now()`, which is monotonic and immune
 * to wall-clock changes (e.g. NTP sync) mid-session.
 */
export function useCountdown( expiresUnixSeconds: number | undefined ): Countdown | null {
	const [ tick, setTick ] = useState( 0 );
	const [ baseline, setBaseline ] = useState< {
		perfStart: number;
		totalMs: number;
		expiresAt: number;
	} | null >( null );

	useEffect( () => {
		if ( ! expiresUnixSeconds ) {
			setBaseline( null );
			return;
		}
		if ( baseline?.expiresAt === expiresUnixSeconds ) {
			return;
		}
		const totalMs = Math.max( 0, expiresUnixSeconds * 1000 - Date.now() );
		setBaseline( {
			perfStart: performance.now(),
			totalMs,
			expiresAt: expiresUnixSeconds,
		} );
	}, [ expiresUnixSeconds, baseline ] );

	useEffect( () => {
		if ( ! baseline || baseline.totalMs === 0 ) {
			return;
		}
		const id = setInterval( () => setTick( ( t ) => t + 1 ), 250 );
		return () => clearInterval( id );
	}, [ baseline ] );

	if ( ! baseline ) {
		return null;
	}

	const elapsed = performance.now() - baseline.perfStart;
	const remainingMs = Math.max( 0, baseline.totalMs - elapsed );
	void tick;

	return {
		remainingMs,
		totalMs: baseline.totalMs,
		hasExpired: remainingMs <= 0,
	};
}
