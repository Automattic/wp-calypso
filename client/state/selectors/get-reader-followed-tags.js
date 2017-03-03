/**
 * External dependencies
 */
import { filter } from 'lodash';

/**
 * Returns all of the reader tags a user is following
 *
 * @param  {Object}  state  Global state tree
 * @return {Array}          Reader Tags
 */
export default function getReaderFollowedTags( state ) {
	return filter( state.reader.tags.items, tag => tag.isFollowing );
}
