/** @format */

/**
 * External dependencies
 */

import { find } from 'lodash';

/**
 * Internal Dependencies
 */
import { prepareComparableUrl } from 'state/reader/follows/utils';

export default function isFollowing( state, { feedUrl, feedId, blogId } ) {
	let follow;
	let comparableUrl;

	if ( feedUrl ) {
		comparableUrl = prepareComparableUrl( feedUrl );
	}

	if ( comparableUrl ) {
		follow = state.reader.follows.items[ comparableUrl ];
	} else if ( feedId ) {
		follow = find( state.reader.follows.items, { feed_ID: feedId } );
	} else if ( blogId ) {
		follow = find( state.reader.follows.items, { blog_ID: blogId } );
	}

	return !! follow && follow.is_following;
}
