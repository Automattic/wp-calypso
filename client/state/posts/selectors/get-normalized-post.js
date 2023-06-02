import { createSelector } from '@automattic/state-utils';
import { getPost } from 'calypso/state/posts/selectors/get-post';
import { normalizePostForDisplay } from 'calypso/state/posts/utils';

import 'calypso/state/posts/init';

/**
 * Returns a normalized post object by its global ID, or null if the post does
 * not exist. A normalized post includes common transformations to prepare the
 * post for display.
 *
 * @param   {Object}  state    Global state tree
 * @param   {string}  globalId Post global ID
 * @returns {?Object}          Post object
 */
export const getNormalizedPost = createSelector(
	( state, globalId ) => normalizePostForDisplay( getPost( state, globalId ) ),
	( state ) => [ state.posts.items, state.posts.queries ]
);
