import { useSelector } from 'calypso/state';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';

/**
 * Returns whether the user wants seen/read posts UI enabled.
 *
 * Stays disabled until remote preferences have loaded, so we never act on the
 * optimistic default for a user who turned the feature off — e.g. auto-marking
 * a directly-opened post as read during startup before /me/preferences returns.
 * Once loaded, an absent key defaults to true.
 */
export function useSeenPostsPreferenceEnabled(): boolean {
	return useSelector( ( state ) =>
		hasReceivedRemotePreferences( state )
			? getPreference( state, 'reader-seen-posts' ) ?? true
			: false
	);
}
