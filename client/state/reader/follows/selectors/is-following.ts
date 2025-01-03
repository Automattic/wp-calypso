import { find } from 'lodash';
import getReaderAliasedFollowFeedUrl from 'calypso/state/reader/follows/selectors/get-reader-aliased-follow-feed-url';
import { prepareComparableUrl } from 'calypso/state/reader/follows/utils';
import { AppState } from 'calypso/types';

import 'calypso/state/reader/init';

interface IsFollowingArgs {
	feedUrl?: string;
	feedId?: number;
	blogId?: number;
}

export default function isFollowing( state: AppState, args: IsFollowingArgs ): boolean {
	const { feedUrl, feedId, blogId } = args;
	let follow;

	if ( feedUrl ) {
		const url = getReaderAliasedFollowFeedUrl( state, feedUrl );
		follow = state.reader.follows.items[ prepareComparableUrl( url ) ];
	} else if ( feedId ) {
		follow = find( state.reader.follows.items, { feed_ID: feedId } );
	} else if ( blogId ) {
		follow = find( state.reader.follows.items, { blog_ID: blogId } );
	}

	return !! follow && follow.is_following;
}
