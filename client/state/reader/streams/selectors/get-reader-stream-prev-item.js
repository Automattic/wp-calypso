/**
 * Internal dependencies
 */
import getReaderStreamOffsetItem from 'calypso/state/reader/streams/selectors/get-reader-stream-offset-item';

import 'calypso/state/reader/init';

function getPrevItem( state, currentItem ) {
	return getReaderStreamOffsetItem( state, currentItem, -1 );
}

export default getPrevItem;
