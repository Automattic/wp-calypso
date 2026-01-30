import 'calypso/state/reader/init';
import { find } from 'lodash';
import getReaderAliasedFollowFeedUrl from 'calypso/state/reader/follows/selectors/get-reader-aliased-follow-feed-url';
import { prepareComparableUrl } from 'calypso/state/reader/follows/utils';
import { AppState } from 'calypso/types';
import { ReaderFollowState } from './types';

export default function isFollowing(
	state: AppState,
	{ feedUrl, feedId, blogId }: { feedUrl?: string; feedId?: number; blogId?: number }
): boolean {
	let follow;
	const follows: ReaderFollowState = state.reader.follows;

	if ( feedUrl ) {
		const url = getReaderAliasedFollowFeedUrl( state, feedUrl );
		follow = follows.items[ prepareComparableUrl( url ) ];
	}

	if ( ! follow && feedId ) {
		follow = find( follows.items, { feed_ID: feedId } );
	}

	if ( ! follow && blogId ) {
		follow = find( follows.items, { blog_ID: blogId } );
	}

	return !! follow?.is_following;
}
