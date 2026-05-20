/**
 * useArchivedReports
 *
 * Tracks which Amplify reports the current user has archived. Archive state
 * is a UI concern only — the underlying R2 index has no notion of archival —
 * so we maintain the set of archived report IDs client-side and merge it in
 * when deriving each report's display status.
 *
 * ⚠️  INTERIM IMPLEMENTATION — READ BEFORE TOUCHING ⚠️
 *
 * This hook backs archive state with `localStorage`. That gives us:
 *   - Persistence across page reloads and browser restarts on the same
 *     device (good enough for an internal Partner Manager tool today).
 *   - Cross-tab sync via the `storage` event (so archiving in one tab
 *     reflects in another within the same browser).
 *
 * What it intentionally does NOT give us:
 *   - Cross-device sync. Archiving on a laptop does not propagate to a
 *     phone or to a different Mac.
 *   - Cross-user sync. Archive is per-browser, not per-Automattician.
 *
 * When the WordPress.com endpoint that owns Amplify reports is built
 * (mirroring the referrals pattern — see
 * client/a8c-for-agencies/data/referrals/use-archive-referral.ts and
 * client/a8c-for-agencies/sections/referrals/hooks/use-handle-referral-archive.ts),
 * replace the localStorage read/write inside this hook with a wpcom
 * `useMutation` call and switch the read side to a server-driven status
 * field on each report. The public surface of this hook (`isArchived`,
 * `toggleArchive`, `archivedIds`) is designed so the swap is a near-
 * mechanical change inside this file — the call sites in
 * `amplify-reports-content.tsx` should not need to change.
 *
 * Tracked in the README "What still needs to be built" section under
 * the wpcom endpoint work.
 */

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'amplify_archived_reports';

function readArchivedIds(): Set< string > {
	if ( typeof window === 'undefined' ) {
		return new Set();
	}
	try {
		const raw = window.localStorage.getItem( STORAGE_KEY );
		if ( ! raw ) {
			return new Set();
		}
		const parsed: unknown = JSON.parse( raw );
		// Defensive — localStorage is user-writable and could contain
		// anything (a different format from an older build, a string, etc.).
		// Drop non-string entries silently rather than throwing.
		if ( ! Array.isArray( parsed ) ) {
			return new Set();
		}
		return new Set( parsed.filter( ( id ): id is string => typeof id === 'string' ) );
	} catch {
		return new Set();
	}
}

function writeArchivedIds( ids: Set< string > ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		window.localStorage.setItem( STORAGE_KEY, JSON.stringify( [ ...ids ] ) );
	} catch {
		// localStorage can throw (Safari private mode, quota exceeded).
		// Fail silently — the in-memory state still reflects the user's
		// intent for this session.
	}
}

export type UseArchivedReports = {
	/** Set of archived report IDs. Treat as read-only; do not mutate. */
	archivedIds: Set< string >;
	isArchived: ( id: string ) => boolean;
	archive: ( id: string ) => void;
	unarchive: ( id: string ) => void;
};

export default function useArchivedReports(): UseArchivedReports {
	const [ archivedIds, setArchivedIds ] = useState< Set< string > >( readArchivedIds );

	// Keep multiple tabs in this browser in sync. The `storage` event fires
	// in *other* tabs when the value changes, not the one that wrote it —
	// the writing tab already has the latest value via setArchivedIds.
	useEffect( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}
		const onStorage = ( event: StorageEvent ) => {
			if ( event.key !== STORAGE_KEY ) {
				return;
			}
			setArchivedIds( readArchivedIds() );
		};
		window.addEventListener( 'storage', onStorage );
		return () => window.removeEventListener( 'storage', onStorage );
	}, [] );

	const isArchived = useCallback(
		( id: string ): boolean => archivedIds.has( id ),
		[ archivedIds ]
	);

	const archive = useCallback( ( id: string ): void => {
		setArchivedIds( ( prev ) => {
			if ( prev.has( id ) ) {
				return prev;
			}
			const next = new Set( prev );
			next.add( id );
			writeArchivedIds( next );
			return next;
		} );
	}, [] );

	const unarchive = useCallback( ( id: string ): void => {
		setArchivedIds( ( prev ) => {
			if ( ! prev.has( id ) ) {
				return prev;
			}
			const next = new Set( prev );
			next.delete( id );
			writeArchivedIds( next );
			return next;
		} );
	}, [] );

	return { archivedIds, isArchived, archive, unarchive };
}
