/** @format */

/**
 * External dependencies
 */

import { filter, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import { default as createSelector } from 'lib/create-selector';

/**
 * Selector for all of the reader tags a user is following. Sorted by tag slug
 */
const getReaderFollowedTags = createSelector(
	state => {
		return state.reader.tags.items
			? sortBy( filter( state.reader.tags.items, tag => tag.isFollowing ), 'slug' )
			: null; // no data loaded
	},
	state => [ state.reader.tags.items ]
);

export default getReaderFollowedTags;
