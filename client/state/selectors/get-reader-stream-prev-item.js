/**
 * Internal dependencies
 */
import getReaderStreamOffsetItem from 'state/selectors/get-reader-stream-offset-item';

function getPrevItem( state, currentItem ) {
	return getReaderStreamOffsetItem( state, currentItem, -1 );
}

export default getPrevItem;
