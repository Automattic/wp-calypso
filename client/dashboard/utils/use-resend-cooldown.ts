import { useCallback, useEffect, useRef, useState } from 'react';
import { EVERY_SECOND, useInterval } from 'calypso/lib/interval';
import { cooldownDeadline, cooldownRemainingSeconds } from './email-verification-resend';

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

	// Only ever extends, like `adopt`: a response can arrive after another tab has already
	// recorded a longer wait, and shortening would reopen the button while the server still
	// refuses. `reset` is the way to clear one.
	const hold = useCallback( ( seconds: number ) => {
		deadlineRef.current = Math.max( deadlineRef.current, cooldownDeadline( seconds ) );
		setSecondsUntilResend( cooldownRemainingSeconds( deadlineRef.current ) );
		onHoldRef.current?.( deadlineRef.current );
	}, [] );

	const reset = useCallback( () => {
		deadlineRef.current = 0;
		setSecondsUntilResend( 0 );
	}, [] );

	// Adopts a deadline claimed elsewhere — another tab, say. Unlike `hold` it doesn't report the
	// deadline back, so a caller that persists one can sync without writing it again.
	const adopt = useCallback( ( deadline: number ) => {
		if ( deadline <= deadlineRef.current ) {
			return;
		}
		deadlineRef.current = deadline;
		setSecondsUntilResend( cooldownRemainingSeconds( deadline ) );
	}, [] );

	useInterval( sync, secondsUntilResend > 0 && EVERY_SECOND );

	// Catch up in one step rather than resuming where the suspended timer stopped.
	useEffect( () => {
		const onVisibilityChange = () => {
			if ( document.visibilityState === 'visible' ) {
				sync();
			}
		};
		document.addEventListener( 'visibilitychange', onVisibilityChange );
		return () => document.removeEventListener( 'visibilitychange', onVisibilityChange );
	}, [ sync ] );

	return { secondsUntilResend, hold, reset, adopt };
}
