import { useSelector } from 'calypso/state';
import { getPreference } from 'calypso/state/preferences/selectors';

/**
 * Returns whether the user wants seen/read posts UI enabled.
 * Defaults to true when the preference has never been set.
 */
export function useSeenPostsPreferenceEnabled(): boolean {
	return useSelector( ( state ) => getPreference( state, 'reader-seen-posts' ) ?? true );
}
