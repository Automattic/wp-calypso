import { useOrganizationId } from 'calypso/reader/data/site-subscriptions/use-follow-selectors';
import { SeenArgs, useIsSeenEnabled, isPostAnAFKPost } from './use-is-seen-enabled';

/**
 * Returns true if the user can apply the seen state to a post, false otherwise.
 *
 * Mainly we need this because we want to show the seen state for AFK posts, but not allow users to mark them as seen.
 */
export function useIsSeenVisible( { feedId, blogId, post }: SeenArgs ): boolean {
	const isSeenEnabled = useIsSeenEnabled( { feedId, blogId } );
	const organizationId = useOrganizationId( feedId, blogId );

	if ( ! isSeenEnabled ) {
		return false;
	}

	if ( isPostAnAFKPost( organizationId, post ) ) {
		return true;
	}

	return Boolean( post?.is_seen );
}
