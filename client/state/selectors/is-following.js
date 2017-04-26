/**
 * External Dependencies
 */
import { find } from 'lodash';

export default function isFollowing( state, { feedUrl, feedId, blogId } ) {
	// should we use prepareComparableUrl here?
	const predicate = {};
	if ( feedId ) {
		predicate.feed_ID = feedId;
	} else if ( blogId ) {
		predicate.blog_ID = blogId;
	} else if ( feedUrl ) {
		predicate.URL = feedUrl;
	}
	const follow = find( state.reader.follows.items, predicate );
	return !! follow && follow.is_following;
}
