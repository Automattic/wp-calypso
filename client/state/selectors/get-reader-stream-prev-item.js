/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencie
 */
import { getReaderStreamOffsetItem } from 'state/selectors';

function getPrevItem( state, currentItem ) {
	return getReaderStreamOffsetItem( state, currentItem, -1 );
}

export default getPrevItem;
