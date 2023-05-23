import 'calypso/state/reader/init';

/**
 * Returns all of the reader tags cached in calypso
 *
 *
 * @param {Object}  state  Global state tree
 * @returns {Array}        Reader Tags
 */

export default function getReaderTagBySlug( state, slug ) {
	const tags = state.reader.tags.items;
	return tags ? Object.values( tags ).find( ( tag ) => tag.slug === slug ) : null;
}
