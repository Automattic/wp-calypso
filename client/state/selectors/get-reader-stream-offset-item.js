/** @format */

/**
 * External dependencies
 */
import { findIndex } from 'lodash';

/**
 * Internal dependencie
 */
import { keysAreEqual } from 'reader/post-key';
import getCurrentStream from 'state/selectors/get-reader-current-stream';

/*
 * given state, an item, and an offset: return the item that is offset away from the currentItem in the list.
 * For example: in order to get the next item directly after the current one you can do: getOffsetItem( state, currentItem, 1 )
 * If the offset would be out of bounds, this function returns null;
 */
function getOffsetItem( state, currentItem, offset ) {
	const streamKey = getCurrentStream( state );
	if ( ! streamKey || ! state.reader.streams[ streamKey ] ) {
		return null;
	}

	const stream = state.reader.streams[ streamKey ];
	const index = findIndex( stream.items, item => keysAreEqual( item, currentItem ) );
	const newIndex = index + offset;

	if ( newIndex >= 0 && newIndex < stream.items.length ) {
		return stream.items[ newIndex ];
	}

	return null;
}

export default getOffsetItem;
