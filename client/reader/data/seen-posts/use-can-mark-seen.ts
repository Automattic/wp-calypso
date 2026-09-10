import { useSiteSubscriptionOrganizationId } from 'calypso/reader/data/site-subscriptions';
import { SeenArgs, useIsSeenEnabled, isPostAnAFKPost } from './use-is-seen-enabled';

/**
 * Returns true if the user can mark a post as seen, false otherwise.
 */
export function useCanMarkSeen( { feedId, blogId, post }: SeenArgs ): boolean {
	const isSeenEnabled = useIsSeenEnabled( { feedId, blogId } );
	const organizationId = useSiteSubscriptionOrganizationId( feedId, blogId );

	if ( ! isSeenEnabled ) {
		return false;
	}

	if ( isPostAnAFKPost( organizationId, post ) ) {
		return false;
	}

	return true;
}
