/**
 * Internal dependencies
 */
import 'calypso/state/reader/init';

/**
 * Returns all of the reader tags cached in calypso
 *
 *
 * @param {object}  state  Global state tree
 * @returns {Array}          Reader Tags
 */

export default function getReaderTags( state ) {
	return state.reader.tags.items;
}
