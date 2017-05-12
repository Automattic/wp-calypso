/**
 * External Dependencies
 */
import { find, includes } from 'lodash';

/**
 * Internal Dependencies
 */
import { prepareComparableUrl } from 'state/reader/follows/utils';

export default function isFollowing( state, { feedUrl, feedId, blogId } ) {
	let follow;
	if ( feedUrl ) {
		const url = prepareComparableUrl( feedUrl );
		follow = state.reader.follows.items[ url ];
		// if follow by url make sure it hasn't been aliased
		if ( ! follow ) {
			follow = find( state.reader.follows.items, f => includes( f.alias_feed_URLs, url ) );
		}
	} else if ( feedId ) {
		follow = find( state.reader.follows.items, { feed_ID: feedId } );
	} else if ( blogId ) {
		follow = find( state.reader.follows.items, { blog_ID: blogId } );
	}
	return !! follow && follow.is_following;
}
