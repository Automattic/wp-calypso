import { isAutomatticianQuery, readSubscribedListsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	useHasSiteSubscriptionOrganization,
	useIsSubscribed,
} from 'calypso/reader/data/site-subscriptions';
import { useSelector } from 'calypso/state';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

interface IsSeenEnabledArgs {
	feedId?: number | string; // Route params arrive as strings.
	blogId?: number | string; // Route params arrive as strings.
	post?: { is_seen?: boolean };
}

/**
 * Returns true if the user can mark a post as seen.
 */
export function useIsSeenEnabled( { feedId, blogId, post }: IsSeenEnabledArgs ): boolean {
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );
	const isSubscribed = useIsSubscribed( { feedId, blogId } );
	const hasOrganization = useHasSiteSubscriptionOrganization( feedId, blogId );
	const isWPForTeamsItem = useSelector( ( state ) => isSiteWPForTeams( state, Number( blogId ) ) );
	const { data: subscribedLists } = useQuery( readSubscribedListsQuery() );

	// If the post is already marked as seen, then prefer that over the subscription check.
	if ( post?.is_seen ) {
		return true;
	}

	const isP2 = hasOrganization || Boolean( isWPForTeamsItem );
	const isInSubscribedList = !! subscribedLists?.lists.some( ( list ): boolean =>
		list.feeds.some( ( feed ): boolean => feed.feed_id === Number( feedId ) )
	);

	return (
		// Allow users on subscribed P2's (keeping existing functionality as is before public release).
		( isP2 && ( isSubscribed || isInSubscribedList ) ) ||
		// Allow automatticians on all p2's regardless of subscription, or any feed they are subscribed to.
		( Boolean( isAutomattician ) && ( isP2 || isSubscribed || isInSubscribedList ) )
	);
}
