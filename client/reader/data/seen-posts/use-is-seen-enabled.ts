import { isAutomatticianQuery, readSubscribedListsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useIsSubscribed } from 'calypso/reader/data/site-subscriptions';
import { useSelector } from 'calypso/state';
import { AUTOMATTIC_ORG_ID } from 'calypso/state/reader/organizations/constants';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { useSeenPostsPreferenceEnabled } from './use-seen-posts-preference-enabled';

const SEEN_DISABLED_ROUTES = [
	'/activities/likes',
	'/reader/conversations',
	'/reader/conversations/a8c',
];

export interface SeenArgs {
	feedId?: number | string;
	blogId?: number | string;
	organizationId?: number; // Organization ID from the feed or blog when no posts are available.
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
export function useIsSeenEnabled( {
	feedId,
	blogId,
	organizationId,
	post,
}: SeenArgs = {} ): boolean {
	const isPreferenceEnabled = useSeenPostsPreferenceEnabled();
	const isSubscribed = useIsSubscribed( { feedId, blogId } );
	const isWPForTeamsItem = useSelector( ( state ) => isSiteWPForTeams( state, Number( blogId ) ) );
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );
	const { data: subscribedLists } = useQuery( readSubscribedListsQuery() );
	const currentRoute = useSelector( getCurrentRoute );

	if ( ! isPreferenceEnabled ) {
		return false;
	}

	// Without a feed, blog or organization there is nothing to gate on, so fall back to enabled.
	if ( ! feedId && ! blogId && ! organizationId ) {
		return isPreferenceEnabled;
	}

	if ( currentRoute && SEEN_DISABLED_ROUTES.includes( currentRoute ) ) {
		return false;
	}

	const isP2 =
		Boolean( post?.organization_id ) || Boolean( organizationId ) || Boolean( isWPForTeamsItem );
	const isInSubscribedList = !! subscribedLists?.lists.some( ( list ): boolean =>
		list.feeds.some( ( feed ): boolean => feed.feed_id === Number( feedId ) )
	);

	// Enabled for all users subscribed to the feed, or subscribed to a list containing it.
	// If feed is a P2 then enable it for automatticians even if they are not subscribed.
	return isSubscribed || isInSubscribedList || ( Boolean( isAutomattician ) && isP2 );
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
