import { useCallback, useEffect, useRef, useState } from 'react';
import { EVERY_SECOND, useInterval } from 'calypso/lib/interval';
import { cooldownDeadline, cooldownRemainingSeconds } from './resend';

interface Options {
	// A cooldown already in effect, for a caller that persists one across a reload.
	initialDeadline?: number;
	onHold?: ( deadline: number ) => void;
	// For retiring anything that only made sense while the wait was on — a notice explaining
	// it, most obviously.
	onExpire?: () => void;
}

/**
 * A countdown to the next permitted resend.
 *
 * Anchored to a deadline rather than decremented, because timers are suspended while the tab is
 * in the background — which is exactly where someone is while checking their email.
 */
export function useResendCooldown( { initialDeadline = 0, onHold, onExpire }: Options = {} ) {
	const deadlineRef = useRef( initialDeadline );
	const [ secondsUntilResend, setSecondsUntilResend ] = useState( () =>
		cooldownRemainingSeconds( deadlineRef.current )
	);

	// Kept in refs so a caller passing inline callbacks doesn't get a new `hold` every render.
	const onExpireRef = useRef( onExpire );
	onExpireRef.current = onExpire;
	const onHoldRef = useRef( onHold );
	onHoldRef.current = onHold;

	const sync = useCallback( () => {
		const remaining = cooldownRemainingSeconds( deadlineRef.current );
		setSecondsUntilResend( remaining );
		if ( remaining === 0 ) {
			onExpireRef.current?.();
		}
	}, [] );

	const hold = useCallback( ( seconds: number ) => {
		deadlineRef.current = cooldownDeadline( seconds );
		setSecondsUntilResend( cooldownRemainingSeconds( deadlineRef.current ) );
		onHoldRef.current?.( deadlineRef.current );
	}, [] );

	// A cooldown belongs to what it was claimed against. Whoever changes that — a different
	// address, a different endpoint — has to drop it, or the new target inherits a wait nothing
	// on the server is actually enforcing.
	const reset = useCallback( () => {
		deadlineRef.current = 0;
		setSecondsUntilResend( 0 );
	}, [] );

	useInterval( sync, secondsUntilResend > 0 && EVERY_SECOND );

	// Coming back to a backgrounded tab, the countdown catches up in one step rather than
	// resuming where the suspended timer left off.
	useEffect( () => {
		const onVisibilityChange = () => {
			if ( document.visibilityState === 'visible' ) {
				sync();
			}
		};
		document.addEventListener( 'visibilitychange', onVisibilityChange );
		return () => document.removeEventListener( 'visibilitychange', onVisibilityChange );
	}, [ sync ] );

	return { secondsUntilResend, hold, reset };
}
