import { useSelector } from 'calypso/state';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';

/**
 * Returns whether the user wants seen/read posts UI enabled.
 *
 * False until remote preferences load, so a user who turned the feature off is
 * never briefly treated as opted in. Once loaded, an absent key defaults to true.
 */
export function useSeenPostsPreferenceEnabled(): boolean {
	return useSelector( ( state ) =>
		hasReceivedRemotePreferences( state )
			? ( getPreference( state, 'reader-seen-posts' ) ?? true )
			: false
	);
}
