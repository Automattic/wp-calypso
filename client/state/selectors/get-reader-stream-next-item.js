/**
 * External dependencies
 */

/**
 * Internal dependencie
 */
import getReaderStreamOffsetItem from 'state/selectors/get-reader-stream-offset-item';

function getNextItem( state, currentItem ) {
	return getReaderStreamOffsetItem( state, currentItem, 1 );
}

export default getNextItem;
