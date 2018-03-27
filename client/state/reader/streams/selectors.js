/** @format */
/**
 * External dependencies
 */
import { findIndex } from 'lodash';
import treeSelect from 'lib/tree-select';

/**
 * Internal dependencies
 */
import { keysAreEqual } from 'reader/post-key';
import {
	injectRecommendations,
	getDistanceBetweenRecs,
	combineCards,
	RECS_PER_BLOCK,
} from 'reader/stream/utils';
import { getReaderFollows } from 'state/selectors';

const emptyStream = { items: [], pendingItems: [], lastPage: false, isRequesting: false };

export const getStream = ( state, streamKey ) => state.reader.streams[ streamKey ] || emptyStream;
export const getCurrentStream = state => state.ui.reader.currentStream;

/*
 * given state, an item, and an offset: return the item that is offset away from the currentItem in the list.
 * For example: in order to get the next item directly after the current one you can do: getOffsetItem( state, currentItem, 1 )
 * If the offset would be out of bounds, this function returns null;
 */
function getOffsetItem( state, currentItem, offset ) {
	const streamKey = getCurrentStream( state );
	if ( ! streamKey ) {
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

export const getNextItem = ( state, currentItem ) => getOffsetItem( state, currentItem, 1 );
export const getPreviousItem = ( state, currentItem ) => getOffsetItem( state, currentItem, -1 );

export const getTransformedStreamItems = treeSelect(
	( state, { streamKey, recsStreamKey } ) => [
		getStream( state, streamKey ).items,
		getStream( state, recsStreamKey ).items,
		getReaderFollows( state ),
	],
	( [ items, recs, follows ], { shouldCombine } ) => {
		if ( items.length === 0 ) {
			return [];
		}

		if ( recs.length > 0 ) {
			items = injectRecommendations( items, recs, getDistanceBetweenRecs( follows.length ) );
		}
		if ( shouldCombine ) {
			items = combineCards( items );
		}
		return items;
	},
	{
		getCacheKey: ( { streamKey, recsStreamKey, shouldCombine } ) =>
			`${ streamKey }${ recsStreamKey }${ shouldCombine }`,
	}
);

export function shouldRequestRecs( state, streamKey, recsStreamKey ) {
	if ( ! recsStreamKey ) {
		return false;
	}

	const totalSubs = getReaderFollows( state ).length;
	const items = getStream( state, streamKey ).items;
	const recs = getStream( state, recsStreamKey ).items;

	// do we have enough recs? if we have a store, but not enough recs, we should fetch some more...
	return recs.length < items.length * ( RECS_PER_BLOCK / getDistanceBetweenRecs( totalSubs ) );
}
