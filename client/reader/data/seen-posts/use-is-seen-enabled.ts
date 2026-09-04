import { readSubscribedListsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	useHasSiteSubscriptionOrganization,
	useIsSubscribed,
} from 'calypso/reader/data/site-subscriptions';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { useIsSeenPostsAvailable } from './use-is-seen-posts-available';
import { useSeenPostsPreferenceEnabled } from './use-seen-posts-preference-enabled';

const SEEN_DISABLED_ROUTES = [
	'/activities/likes',
	'/reader/conversations',
	'/reader/conversations/a8c',
];

interface IsSeenEnabledArgs {
	feedId?: number | string; // Route params arrive as strings.
	blogId?: number | string; // Route params arrive as strings.
	post?: { is_seen?: boolean };
}

/**
 * Returns true if the user can mark a post as seen.
 */
export function useIsSeenEnabled( { feedId, blogId, post }: IsSeenEnabledArgs ): boolean {
	const isPreferenceEnabled = useSeenPostsPreferenceEnabled();
	const isSeenPostsAvailable = useIsSeenPostsAvailable();
	const isSubscribed = useIsSubscribed( { feedId, blogId } );
	const hasOrganization = useHasSiteSubscriptionOrganization( feedId, blogId );
	const isWPForTeamsItem = useSelector( ( state ) => isSiteWPForTeams( state, Number( blogId ) ) );
	const { data: subscribedLists } = useQuery( readSubscribedListsQuery() );
	const currentRoute = useSelector( getCurrentRoute );

	if ( ! isPreferenceEnabled ) {
		return false;
	}

	if ( currentRoute && SEEN_DISABLED_ROUTES.includes( currentRoute ) ) {
		return false;
	}

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
		// Allow rolled-out users on all p2's regardless of subscription, or any feed they are subscribed to.
		( isSeenPostsAvailable && ( isP2 || isSubscribed || isInSubscribedList ) )
	);
}
