import { SeenArgs, useIsSeenEnabled, isPostAnAFKPost } from './use-is-seen-enabled';

/**
 * Returns true if the user can mark a post as seen, false otherwise.
 */
export function useCanMarkSeen( { feedId, blogId, post }: SeenArgs ): boolean {
	const isSeenEnabled = useIsSeenEnabled( { feedId, blogId, post } );

	return isPostAnAFKPost( post ) ? false : isSeenEnabled;
}
