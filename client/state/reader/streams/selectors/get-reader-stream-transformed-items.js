import treeSelect from '@automattic/tree-select';
import {
	injectRecommendations,
	getDistanceBetweenRecs,
	injectPrompts,
	getDistanceBetweenPrompts,
} from 'calypso/reader/stream/utils';
import { getReaderFollows } from 'calypso/state/reader/follows/selectors';
import getReaderStream from 'calypso/state/reader/streams/selectors/get-reader-stream';

import 'calypso/state/reader/init';

/*
 * getTransformedStreamItems performs the transformations from raw state to data suitable for
 * Reader cards. That means injecting recs.
 * Signature is:
 * function( state, { streamKey: string, recsStreamKey: string }): Array
 */
export const getTransformedStreamItems = treeSelect(
	( state, { streamKey, recsStreamKey } ) => [
		getReaderStream( state, streamKey ).items,
		getReaderStream( state, recsStreamKey ).items,
		getReaderFollows( state ),
	],
	( [ items, recs, follows ] ) => {
		if ( items.length === 0 ) {
			return [];
		}

		if ( recs.length > 0 ) {
			items = injectRecommendations( items, recs, getDistanceBetweenRecs( follows.length ) );
		}

		items = injectPrompts( items, getDistanceBetweenPrompts( follows.length ) );

		return items;
	},
	{
		getCacheKey: ( { streamKey, recsStreamKey } ) => `${ streamKey }${ recsStreamKey }`,
	}
);

export default getTransformedStreamItems;
