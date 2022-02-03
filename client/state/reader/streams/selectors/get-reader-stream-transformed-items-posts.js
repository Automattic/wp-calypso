import { createSelector } from '@automattic/state-utils';
import { keyForPost } from 'calypso/reader/post-key';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { getTransformedStreamItems } from 'calypso/state/reader/streams/selectors';

import 'calypso/state/reader/init';

const getTransformedStreamItemsPosts = createSelector(
	( state, { streamKey, recsStreamKey, shouldCombine } ) =>
		getTransformedStreamItems( state, {
			streamKey,
			recsStreamKey,
			shouldCombine,
		} ).map( ( postKey ) => {
			const key = postKey.isCombination ? keyForPost( postKey ) : postKey;
			return getPostByKey( state, key );
		} ),
	( state, { streamKey, recsStreamKey, shouldCombine } ) => [
		getTransformedStreamItems( state, {
			streamKey,
			recsStreamKey,
			shouldCombine,
		} ),
	]
);

export default getTransformedStreamItemsPosts;
