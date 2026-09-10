import { isAutomatticianQuery, readSubscribedListsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useIsSubscribed } from 'calypso/reader/data/site-subscriptions';
import { useSelector } from 'calypso/state';
import { AUTOMATTIC_ORG_ID } from 'calypso/state/reader/organizations/constants';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

const SEEN_DISABLED_ROUTES = [
	'/activities/likes',
	'/reader/conversations',
	'/reader/conversations/a8c',
];

export interface SeenArgs {
	feedId?: number | string; // Route params arrive as strings.
	blogId?: number | string; // Route params arrive as strings.
	post?: {
		is_seen?: boolean;
		tags?: Record< string, { slug?: string } >;
		site_is_private?: boolean;
		organization_id?: number;
	};
}

/**
 * Return true if the seen feature is enabled for the current user, false otherwise.
 */
export function useIsSeenEnabled( { feedId, blogId, post }: SeenArgs ): boolean {
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );
	const isSubscribed = useIsSubscribed( { feedId, blogId } );
	const isWPForTeamsItem = useSelector( ( state ) => isSiteWPForTeams( state, Number( blogId ) ) );
	const { data: subscribedLists } = useQuery( readSubscribedListsQuery() );
	const currentRoute = useSelector( getCurrentRoute );

	if ( currentRoute && SEEN_DISABLED_ROUTES.includes( currentRoute ) ) {
		return false;
	}

	const isP2 = Boolean( post?.organization_id ) || Boolean( isWPForTeamsItem );
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

export function isPostAnAFKPost( post: SeenArgs[ 'post' ] ): boolean {
	if ( ! post ) {
		return false;
	}

	const isA8CPrivate = post?.organization_id === AUTOMATTIC_ORG_ID && !! post?.site_is_private;
	const isAFKPost = Object.entries( post.tags ?? {} ).some( ( [ name, tag ] ) => {
		return ( tag.slug ?? name ).toLowerCase() === 'afk';
	} );

	return isA8CPrivate && isAFKPost;
}
