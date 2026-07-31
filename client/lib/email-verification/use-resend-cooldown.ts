import { useCallback, useEffect, useRef, useState } from 'react';
import { EVERY_SECOND, useInterval } from 'calypso/lib/interval';
import { cooldownDeadline, cooldownRemainingSeconds } from './resend';

interface Options {
	// When the cooldown already in effect expires, for a caller that persists one across a
	// reload. 0 means no cooldown is running.
	initialDeadline?: number;
	// Called whenever a new cooldown starts, for callers that persist it.
	onHold?: ( deadline: number ) => void;
	// Called when a running cooldown reaches zero, so a caller can retire anything that only
	// made sense while the wait was on — a notice explaining it, most obviously.
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

	// Kept in a ref so a caller passing an inline callback doesn't restart the timer each render.
	const onExpireRef = useRef( onExpire );
	onExpireRef.current = onExpire;

	const sync = useCallback( () => {
		const remaining = cooldownRemainingSeconds( deadlineRef.current );
		setSecondsUntilResend( remaining );
		if ( remaining === 0 ) {
			onExpireRef.current?.();
		}
	}, [] );

	const hold = useCallback(
		( seconds: number ) => {
			deadlineRef.current = cooldownDeadline( seconds );
			setSecondsUntilResend( cooldownRemainingSeconds( deadlineRef.current ) );
			onHold?.( deadlineRef.current );
		},
		[ onHold ]
	);

	useInterval( sync, secondsUntilResend > 0 && EVERY_SECOND );

	// Coming back to a backgrounded tab, the countdown has to catch up in one step rather than
	// resume from where the timer stopped.
	useEffect( () => {
		const onVisibilityChange = () => {
			if ( document.visibilityState === 'visible' ) {
				sync();
			}
		};
		document.addEventListener( 'visibilitychange', onVisibilityChange );
		return () => document.removeEventListener( 'visibilitychange', onVisibilityChange );
	}, [ sync ] );

	return { secondsUntilResend, hold, sync };
}
