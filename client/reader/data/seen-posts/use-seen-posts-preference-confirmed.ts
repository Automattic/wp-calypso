import { useSelector } from 'calypso/state';
import { preferencesLastFetchedTimestamp } from 'calypso/state/preferences/selectors';

// The document's navigation start, which a timestamp restored from the persisted
// preferences slice always predates. Deliberately not the time this module was
// evaluated: Reader ships in a lazy chunk that can load long after
// `/me/preferences` resolved, and confirmation would then never be observed.
const SESSION_START = typeof performance !== 'undefined' ? performance.timeOrigin : Date.now();

/**
 * Whether `/me/preferences` has returned during this page session.
 *
 * The preferences slice is persisted and rehydrated for up to a week, so a
 * returning user starts with values that look loaded but can predate a change
 * made elsewhere — the Dashboard toggle is on its own hostname, so its write
 * never reaches this origin's cached copy.
 *
 * Rendering off those cached values is fine: a stale answer re-renders when the
 * fetch lands. Use this instead for one-shot writes such as auto-marking a post
 * read, which fire once and can't be taken back.
 */
export function useSeenPostsPreferenceConfirmed(): boolean {
	return useSelector( ( state ) => {
		const fetchedAt = preferencesLastFetchedTimestamp( state );
		return typeof fetchedAt === 'number' && fetchedAt >= SESSION_START;
	} );
}
