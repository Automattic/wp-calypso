/**
 * Internal dependencies
 */
import getReaderStreamOffsetItem from './get-reader-stream-offset-item';

import 'state/reader/init';

function getPrevItem( state, currentItem ) {
	return getReaderStreamOffsetItem( state, currentItem, -1 );
}

export default getPrevItem;
