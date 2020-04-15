/**
 * External dependencies
 */
import { findIndex } from 'lodash';

/**
 * Internal dependencies
 */
import { keysAreEqual } from 'reader/post-key';
import getCurrentStream from 'state/selectors/get-reader-current-stream';

import 'state/reader/init';

/*
 * Given state, an item, and an offset: return the item that is offset away from the currentItem in the list.
 *
 * For example: in order to get the next item directly after the current one you can do: getOffsetItem( state, currentItem, 1 ).
 *
 * @param  {object} Redux state
 * @param  {object} Current stream item
 * @param  {integer} Offset from current stream item (e.g. -1 for previous item)
 * @returns {object|null} The stream item, or null if the offset would be out of bounds
 */
function getOffsetItem( state, currentItem, offset ) {
	const streamKey = getCurrentStream( state );
	if ( ! streamKey || ! state.reader.streams[ streamKey ] ) {
		return null;
	}

	const stream = state.reader.streams[ streamKey ];
	let index = findIndex( stream.items, ( item ) => keysAreEqual( item, currentItem ) );

	// If we didn't find a match, check x-posts too
	if ( index < 0 ) {
		index = findIndex( stream.items, ( item ) => keysAreEqual( item.xPostMetadata, currentItem ) );
	}

	if ( index < 0 ) {
		return null;
	}

	const newIndex = index + offset;

	if ( newIndex < 0 || newIndex >= stream.items.length ) {
		return null;
	}

	const offsetItem = stream.items[ newIndex ];

	// If the item is an x-post, return the original post details
	if ( offsetItem && offsetItem.xPostMetadata ) {
		return offsetItem.xPostMetadata;
	}

	return offsetItem;
}

export default getOffsetItem;
