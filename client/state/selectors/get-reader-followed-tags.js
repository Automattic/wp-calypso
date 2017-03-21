/**
 * External dependencies
 */
import { filter, sortBy } from 'lodash';

/**
 * Returns all of the reader tags a user is following
 *
 * @param  {Object}  state  Global state tree
 * @return {Array}          Reader Tags
 */
export default function getReaderFollowedTags( state ) {
	return state.reader.tags.items
		? sortBy( filter( state.reader.tags.items, tag => tag.isFollowing ), 'slug' )
		: null; // no data loaded state
}
