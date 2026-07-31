import { isAutomatticianQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
	useHasSiteSubscriptionOrganization,
	useIsSubscribed,
} from 'calypso/reader/data/site-subscriptions';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

interface IsSeenEnabledArgs {
	feedId?: number;
	blogId?: number;
	post?: { is_seen?: boolean };
}

/**
 * Returns true if the user can mark a post as seen, based on multiple checks:
 *   - If the blog is a P2 site.
 *   - If the user is subscribed to the feed.
 */
export function useIsSeenEnabled( { feedId, blogId, post }: IsSeenEnabledArgs ): boolean {
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );
	const isSubscribed = useIsSubscribed( { feedId, blogId } );
	const hasOrganization = useHasSiteSubscriptionOrganization( feedId, blogId );
	const isWPForTeamsItem = useSelector( ( state ) => isSiteWPForTeams( state, blogId ?? null ) );

	// If a post is provided, it must have an `is_seen` property to be eligible for marking as seen.
	if ( post && ! ( 'is_seen' in post ) ) {
		return false;
	}

	return (
		// Allow users only on p2's subscriptions (keeping existing functionality as is before public release).
		( ( hasOrganization || isWPForTeamsItem ) && isSubscribed ) ||
		// Allow automatticians on all p2's, or any feed they are subscribed to.
		( Boolean( isAutomattician ) && ( hasOrganization || isWPForTeamsItem || isSubscribed ) )
	);
}
