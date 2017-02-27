/**
 * Returns all of the reader teams for a user
 *
 * @param  {Object}  state  Global state tree
 * @return {Array}          Reader Tags
 */
export default function getReaderFollowedTags( state ) {
	return state.reader.tags.items;
}
