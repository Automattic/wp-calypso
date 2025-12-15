import { keyToString } from 'calypso/reader/post-key';
import getCurrentStream from 'calypso/state/selectors/get-reader-current-stream';
import getStream from './get-reader-stream';
import 'calypso/state/reader/init';

/**
 *  Get the pending items removing duplicates
 * @param {*} state
 * @returns {Array} The pending items
 */
export default function getPendingItems( state ) {
	const streamKey = getCurrentStream( state );
	if ( ! streamKey ) {
		return [];
	}
	const stream = getStream( state, streamKey );

	const pendingItems = stream.pendingItems.items;
	if ( pendingItems.length === 0 ) {
		return [];
	}
	const items = stream.items;
	const itemPostIds = new Set( items.map( ( item ) => keyToString( item ) ) );

	return pendingItems.filter( ( pendingItem ) => ! itemPostIds.has( keyToString( pendingItem ) ) );
}
