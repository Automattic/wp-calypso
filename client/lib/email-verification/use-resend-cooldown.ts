import { useCallback, useEffect, useRef, useState } from 'react';
import { EVERY_SECOND, useInterval } from 'calypso/lib/interval';
import { cooldownDeadline, cooldownRemainingSeconds } from './resend';

interface Options {
	// A cooldown already in effect, for a caller that persists one across a reload.
	initialDeadline?: number;
	onHold?: ( deadline: number ) => void;
}

/**
 * A countdown to the next permitted resend.
 *
 * Anchored to a deadline rather than decremented, because timers are suspended while the tab is
 * in the background — which is exactly where someone is while checking their email.
 */
export function useResendCooldown( { initialDeadline = 0, onHold }: Options = {} ) {
	const deadlineRef = useRef( initialDeadline );
	const [ secondsUntilResend, setSecondsUntilResend ] = useState( () =>
		cooldownRemainingSeconds( deadlineRef.current )
	);

	// In a ref so an inline callback doesn't hand out a new `hold` every render.
	const onHoldRef = useRef( onHold );
	onHoldRef.current = onHold;

	const sync = useCallback( () => {
		setSecondsUntilResend( cooldownRemainingSeconds( deadlineRef.current ) );
	}, [] );

	const hold = useCallback( ( seconds: number ) => {
		deadlineRef.current = cooldownDeadline( seconds );
		setSecondsUntilResend( cooldownRemainingSeconds( deadlineRef.current ) );
		onHoldRef.current?.( deadlineRef.current );
	}, [] );

	// A cooldown belongs to what it was claimed against; a new target must not inherit a wait
	// the server isn't enforcing against it.
	const reset = useCallback( () => {
		deadlineRef.current = 0;
		setSecondsUntilResend( 0 );
	}, [] );

	useInterval( sync, secondsUntilResend > 0 && EVERY_SECOND );

	// Returning to a backgrounded tab, the countdown catches up in one step rather than
	// resuming where the suspended timer stopped.
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
