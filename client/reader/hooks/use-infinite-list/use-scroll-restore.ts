import { useEffect } from 'react';
import type { VirtualItem, Virtualizer } from '@tanstack/react-virtual';

interface ScrollSnapshot {
	measurements: VirtualItem[];
	offset: number;
}

// Snapshot per restore key, kept for the SPA session so Back returns to the
// exact scroll position with measured item sizes already known.
const snapshots = new Map< string, ScrollSnapshot >();
const MAX_SNAPSHOTS = 50;

function saveScrollSnapshot( restoreKey: string, snapshot: ScrollSnapshot ): void {
	// Refresh recency when revisiting the same feed/layout.
	if ( snapshots.has( restoreKey ) ) {
		snapshots.delete( restoreKey );
	}
	snapshots.set( restoreKey, snapshot );
	if ( snapshots.size > MAX_SNAPSHOTS ) {
		const oldestKey = snapshots.keys().next().value;
		if ( oldestKey ) {
			snapshots.delete( oldestKey );
		}
	}
}

/**
 * Read a saved scroll snapshot. The component feeds its `measurements` and
 * `offset` into the virtualizer as `initialMeasurementsCache` / `initialOffset`
 * so a remount (e.g. on Back) restores the exact position — unlike restoring a
 * raw pixel offset, which can land in an unmeasured region.
 */
export function readScrollSnapshot( restoreKey: string | undefined ): ScrollSnapshot | undefined {
	return restoreKey ? snapshots.get( restoreKey ) : undefined;
}

/**
 * Save the virtualizer's snapshot (measured sizes + current offset) under
 * `restoreKey` when the list unmounts, for {@link readScrollSnapshot} to replay
 * on the next mount. No-op without a `restoreKey`.
 */
export function useScrollRestore(
	virtualizer: Virtualizer< HTMLElement, Element >,
	restoreKey: string | undefined
): void {
	useEffect( () => {
		if ( ! restoreKey ) {
			return;
		}
		return () => {
			saveScrollSnapshot( restoreKey, {
				measurements: virtualizer.takeSnapshot(),
				offset: virtualizer.scrollOffset ?? 0,
			} );
		};
	}, [ virtualizer, restoreKey ] );
}
