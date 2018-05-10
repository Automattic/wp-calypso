/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencie
 */
import { getReaderStreamOffsetItem } from './';

function getNextItem( state, currentItem ) {
	return getReaderStreamOffsetItem( state, currentItem, 1 );
}

export default getNextItem;
