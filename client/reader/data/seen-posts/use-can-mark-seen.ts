import { SeenArgs, useIsSeenEnabled, isPostAnAFKPost } from './use-is-seen-enabled';

/**
 * Returns true if the user can mark a post as seen, false otherwise.
 */
export function useCanMarkSeen( { feedId, blogId, post }: SeenArgs ): boolean {
	const isSeenEnabled = useIsSeenEnabled( { feedId, blogId, post } );

	if ( ! isSeenEnabled ) {
		return false;
	}

	if ( isPostAnAFKPost( post ) ) {
		return false;
	}

	return true;
}
