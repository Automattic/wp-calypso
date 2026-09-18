import { useCallback, useEffect, useMemo, useState } from 'react';

export const THANK_YOU_WAIT_DEADLINE_MS = 5 * 60 * 1000;
export const THANK_YOU_RECOVERY_INTERVAL_MS = 30 * 1000;

const STORAGE_PREFIX = 'marketplace-thank-you-wait';

const readStartedAt = ( key: string ): number | null => {
	try {
		const startedAt = Number( window.sessionStorage.getItem( key ) );
		return Number.isFinite( startedAt ) && startedAt > 0 ? startedAt : null;
	} catch {
		return null;
	}
};

const writeStartedAt = ( key: string, startedAt: number ) => {
	try {
		window.sessionStorage.setItem( key, String( startedAt ) );
	} catch {}
};

const removeStartedAt = ( key: string ) => {
	try {
		window.sessionStorage.removeItem( key );
	} catch {}
};

export function useThankYouDeadline( {
	siteId,
	productKey,
	enabled,
}: {
	siteId: number | null;
	productKey: string;
	enabled: boolean;
} ) {
	const storageKey = useMemo(
		() => ( siteId ? `${ STORAGE_PREFIX }:${ siteId }:${ productKey }` : null ),
		[ productKey, siteId ]
	);
	const [ deadlineState, setDeadlineState ] = useState< {
		storageKey: string;
		startedAt: number;
	} | null >( () => {
		if ( ! enabled || ! storageKey ) {
			return null;
		}
		return { storageKey, startedAt: readStartedAt( storageKey ) ?? Date.now() };
	} );
	const [ hasTimedOut, setHasTimedOut ] = useState( false );

	useEffect( () => {
		if ( ! enabled || ! storageKey ) {
			setDeadlineState( null );
			return;
		}

		const startedAt = readStartedAt( storageKey ) ?? Date.now();
		writeStartedAt( storageKey, startedAt );
		setDeadlineState( { storageKey, startedAt } );
	}, [ enabled, storageKey ] );

	const isCurrentWait = deadlineState?.storageKey === storageKey;
	const startedAt = isCurrentWait ? deadlineState.startedAt : null;

	// A single timer at the deadline instead of a ticking clock: the only state transition
	// anyone renders on is the deadline crossing.
	useEffect( () => {
		if ( ! enabled || startedAt === null ) {
			setHasTimedOut( false );
			return;
		}

		const remainingMs = startedAt + THANK_YOU_WAIT_DEADLINE_MS - Date.now();
		if ( remainingMs <= 0 ) {
			setHasTimedOut( true );
			return;
		}

		setHasTimedOut( false );
		const id = setTimeout( () => setHasTimedOut( true ), remainingMs );
		return () => clearTimeout( id );
	}, [ enabled, startedAt ] );

	const getWaitedSeconds = useCallback(
		() => ( startedAt === null ? 0 : Math.round( ( Date.now() - startedAt ) / 1000 ) ),
		[ startedAt ]
	);

	const restart = useCallback( () => {
		if ( ! storageKey ) {
			return;
		}

		const nextStartedAt = Date.now();
		writeStartedAt( storageKey, nextStartedAt );
		setDeadlineState( { storageKey, startedAt: nextStartedAt } );
	}, [ storageKey ] );

	const complete = useCallback( () => {
		if ( storageKey ) {
			removeStartedAt( storageKey );
		}
		setDeadlineState( null );
	}, [ storageKey ] );

	return {
		isInitialized: ! enabled || ( !! storageKey && isCurrentWait ),
		hasTimedOut: enabled && hasTimedOut,
		getWaitedSeconds,
		restart,
		complete,
	};
}
