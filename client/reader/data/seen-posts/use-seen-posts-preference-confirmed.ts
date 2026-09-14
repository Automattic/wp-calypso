import { useSelector } from 'calypso/state';
import { preferencesLastFetchedTimestamp } from 'calypso/state/preferences/selectors';

// Navigation start rather than module evaluation time: Reader ships in a lazy
// chunk that can load after `/me/preferences` resolved, which would never confirm.
const SESSION_START = typeof performance !== 'undefined' ? performance.timeOrigin : Date.now();

/**
 * Whether `/me/preferences` has returned during this page session.
 *
 * The preferences slice is rehydrated for up to a week, so values can look
 * loaded while predating a change made elsewhere. Prefer this over
 * `useSeenPostsPreferenceEnabled` for one-shot writes that can't be undone.
 */
export function useSeenPostsPreferenceConfirmed(): boolean {
	return useSelector( ( state ) => {
		const fetchedAt = preferencesLastFetchedTimestamp( state );
		return typeof fetchedAt === 'number' && fetchedAt >= SESSION_START;
	} );
}
