/**
 * External dependencies
 */
import { filter, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Selector for all of the reader tags a user is following. Sorted by tag slug
 */
const getReaderFollowedtags = createSelector(
	state => {
		return state.reader.tags.items
			? sortBy( filter( state.reader.tags.items, tag => tag.isFollowing ), 'slug' )
			: null; // no data loaded
	},
	state => [ state.reader.tags.items ]
);

export default getReaderFollowedtags;
