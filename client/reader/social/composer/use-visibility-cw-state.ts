import { useCallback, useEffect, useState } from 'react';
import type { ActiveMode } from './composer-provider';

export interface UseVisibilityCwStateOptions< V extends string > {
	mode: ActiveMode | null;
	connectionId: number;
	/**
	 * Fallback used when no localStorage pick exists. Read every time
	 * the modal opens (and whenever the connection switches), so a fresh
	 * backend value mid-session percolates through cleanly. Also the
	 * value `clear()` resets the in-memory state to when the provider
	 * fires it on modal close (the localStorage pick is NOT cleared —
	 * it persists across sessions and is re-read on the next open).
	 */
	defaultVisibility: V;
	/** Predicate used to validate localStorage values before adopting them. */
	isValidVisibility: ( value: unknown ) => value is V;
	/**
	 * Builds the per-connection localStorage key. Keep it protocol-
	 * scoped so two protocols on the same browser don't collide
	 * (e.g. `calypso_reader_mastodon_composer_visibility_v1:<id>`).
	 */
	storageKey: ( connectionId: number ) => string;
}

export interface VisibilityCwState< V extends string > {
	visibility: V;
	setVisibility: ( next: V ) => void;
	cwEnabled: boolean;
	setCwEnabled: ( next: boolean ) => void;
	summary: string;
	setSummary: ( next: string ) => void;
	/** Drop visibility / CW / summary back to their pristine state. */
	clear: () => void;
}

/**
 * Shared visibility + content-warning state hook used by Fediverse and
 * Mastodon composer extras. Owns the React state (visibility / CW
 * toggle / summary), persists the user's last visibility pick to
 * localStorage keyed by `(protocol, connectionId)`, and resets back to
 * the supplied `defaultVisibility` when the modal closes.
 *
 * Protocol-specific concerns the caller still owns:
 *
 *  - The `V` enum (Fediverse's `'followers'` vs Mastodon's `'private'`).
 *  - Reading the connection-level default from the cache (passed in as
 *    `defaultVisibility`).
 *  - Mapping the state into the wire payload via the protocol's
 *    `extendBuildParams`.
 *  - Anything not visibility / CW (e.g. Fediverse's per-submit
 *    Idempotency-Key generation).
 */
export function useVisibilityCwState< V extends string >( {
	mode,
	connectionId,
	defaultVisibility,
	isValidVisibility,
	storageKey,
}: UseVisibilityCwStateOptions< V > ): VisibilityCwState< V > {
	const [ visibility, setVisibilityState ] = useState< V >( defaultVisibility );
	const [ cwEnabled, setCwEnabled ] = useState( false );
	const [ summary, setSummary ] = useState( '' );

	// Apply the localStorage override (falling back to the supplied default)
	// each time the modal opens or the connection switches. Reading
	// `defaultVisibility` from deps means a backend update mid-session
	// percolates through cleanly. localStorage access is wrapped in
	// try/catch because private-mode browsers throw on `localStorage.getItem`.
	useEffect( () => {
		if ( ! mode ) {
			return;
		}
		try {
			const stored = window.localStorage.getItem( storageKey( connectionId ) );
			setVisibilityState( isValidVisibility( stored ) ? stored : defaultVisibility );
		} catch {
			setVisibilityState( defaultVisibility );
		}
	}, [ mode, connectionId, defaultVisibility, isValidVisibility, storageKey ] );

	const setVisibility = useCallback(
		( next: V ) => {
			setVisibilityState( next );
			try {
				window.localStorage.setItem( storageKey( connectionId ), next );
			} catch {
				// Best-effort persistence; cosmetic feature.
			}
		},
		[ connectionId, storageKey ]
	);

	const clear = useCallback( () => {
		setVisibilityState( defaultVisibility );
		setCwEnabled( false );
		setSummary( '' );
	}, [ defaultVisibility ] );

	return {
		visibility,
		setVisibility,
		cwEnabled,
		setCwEnabled,
		summary,
		setSummary,
		clear,
	};
}
