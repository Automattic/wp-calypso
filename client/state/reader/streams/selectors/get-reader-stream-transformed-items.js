/**
 * Internal dependencies
 */
import { getReaderFollows } from 'calypso/state/reader/follows/selectors';
import getReaderStream from 'calypso/state/reader/streams/selectors/get-reader-stream';
import treeSelect from '@automattic/tree-select';
import {
	injectRecommendations,
	getDistanceBetweenRecs,
	combineCards,
} from 'calypso/reader/stream/utils';

import 'calypso/state/reader/init';

/*
 * getTransformedStreamItems performs the transformations from raw state to data suitable for
 * Reader cards. That means injecting recs and combining cards.
 * Signature is:
 * function( state, { streamKey: string, recsStreamKey: string, shouldCombine: boolean }): Array
 */
export const getTransformedStreamItems = treeSelect(
	( state, { streamKey, recsStreamKey } ) => [
		getReaderStream( state, streamKey ).items,
		getReaderStream( state, recsStreamKey ).items,
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

export default getTransformedStreamItems;
