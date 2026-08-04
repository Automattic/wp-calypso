import { useCallback, useEffect, useRef, useState } from 'react';
import {
	EVERY_MINUTE,
	EVERY_TEN_SECONDS,
	EVERY_THIRTY_SECONDS,
	useInterval,
} from 'calypso/lib/interval';
import type { TimeoutMS } from 'calypso/types';

// Quick enough at first not to feel stuck, then slow enough that a tab left open — or a fleet of
// them waiting on an endpoint that's already struggling — isn't a problem of its own. It backs off
// rather than stopping: the answer can arrive at any point, and nothing else will fetch it.
const POLL_SCHEDULE: { after: TimeoutMS; delay: TimeoutMS }[] = [
	{ after: 0, delay: EVERY_TEN_SECONDS },
	{ after: 5 * EVERY_MINUTE, delay: EVERY_THIRTY_SECONDS },
	{ after: 10 * EVERY_MINUTE, delay: EVERY_MINUTE },
	{ after: 30 * EVERY_MINUTE, delay: 3 * EVERY_MINUTE },
];

function pollDelayAfter( elapsed: number ): TimeoutMS {
	let delay = POLL_SCHEDULE[ 0 ].delay;
	for ( const step of POLL_SCHEDULE ) {
		if ( elapsed >= step.after ) {
			delay = step.delay;
		}
	}
	return delay;
}

/**
 * Polls on a widening interval while enabled, pausing whenever the tab isn't visible.
 *
 * Coming back to the tab polls at once and re-enters the ladder where the elapsed time puts it —
 * both because that's the strongest signal the answer has changed, and because at the slowest rung
 * the next tick is minutes away. Focus counts as well as visibility: switching to a desktop mail
 * client never hides the tab, so visibility alone would miss the return.
 *
 * `restart` returns to the opening rate, for when something makes an answer newly likely.
 */
export function useBackoffPoll( poll: () => void, isEnabled: boolean ) {
	const pollRef = useRef( poll );
	pollRef.current = poll;

	const startedAt = useRef( Date.now() );
	const [ delay, setDelay ] = useState< TimeoutMS >( POLL_SCHEDULE[ 0 ].delay );
	const [ isVisible, setIsVisible ] = useState( () => document.visibilityState === 'visible' );

	const pollAndAdvance = useCallback( () => {
		pollRef.current();
		setDelay( pollDelayAfter( Date.now() - startedAt.current ) );
	}, [] );

	const restart = useCallback( () => {
		startedAt.current = Date.now();
		setDelay( POLL_SCHEDULE[ 0 ].delay );
	}, [] );

	useEffect( () => {
		if ( ! isEnabled ) {
			return;
		}
		const onVisibilityChange = () => {
			const visible = document.visibilityState === 'visible';
			setIsVisible( visible );
			if ( visible ) {
				pollAndAdvance();
			}
		};
		document.addEventListener( 'visibilitychange', onVisibilityChange );
		window.addEventListener( 'focus', pollAndAdvance );
		return () => {
			document.removeEventListener( 'visibilitychange', onVisibilityChange );
			window.removeEventListener( 'focus', pollAndAdvance );
		};
	}, [ isEnabled, pollAndAdvance ] );

	useInterval( pollAndAdvance, isVisible && isEnabled && delay );

	return { restart };
}
