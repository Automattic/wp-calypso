/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { prepareComparableUrl } from 'state/reader/follows/utils';

export default function isFollowing( state, { feedUrl, feedId, blogId } ) {
	let follow;
	if ( feedUrl ) {
		const url = prepareComparableUrl( feedUrl );
		follow = state.reader.follows.items[ url ];
	} else if ( feedId ) {
		follow = find( state.reader.follows.items, { feed_ID: feedId } );
	} else if ( blogId ) {
		follow = find( state.reader.follows.items, { blog_ID: blogId } );
	}
	return !! follow && follow.is_following;
}
