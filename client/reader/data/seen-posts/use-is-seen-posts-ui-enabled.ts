import { useIsSeenPostsAvailable } from './use-is-seen-posts-available';
import { useSeenPostsPreferenceEnabled } from './use-seen-posts-preference-enabled';

/**
 * Whether Reader should show seen/read UI for this user right now.
 *
 * Combines the rollout gate ({@link useIsSeenPostsAvailable}) with the user's
 * `reader-seen-posts` preference. Prefer this over inlining
 * `isAutomattician && preference` at call sites.
 */
export function useIsSeenPostsUiEnabled(): boolean {
	const isAvailable = useIsSeenPostsAvailable();
	const isPreferenceEnabled = useSeenPostsPreferenceEnabled();
	return isAvailable && isPreferenceEnabled;
}
