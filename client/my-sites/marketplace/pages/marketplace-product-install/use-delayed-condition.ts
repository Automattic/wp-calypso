import { useEffect, useState } from 'react';

/**
 * Reports a condition only once it has held continuously for `delayMs`, and goes back to false as
 * soon as it stops holding — so a condition that recovers late is not latched, and a recurrence
 * waits out a fresh delay rather than being reported at once.
 */
export function useDelayedCondition( condition: boolean, delayMs: number ): boolean {
	const [ hasHeld, setHasHeld ] = useState( false );

	useEffect( () => {
		if ( ! condition ) {
			setHasHeld( false );
			return;
		}
		const id = setTimeout( () => setHasHeld( true ), delayMs );
		return () => clearTimeout( id );
	}, [ condition, delayMs ] );

	return hasHeld;
}
