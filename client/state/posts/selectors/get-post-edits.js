/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { mergePostEdits, normalizePostForEditing } from 'state/posts/utils';

import 'state/posts/init';

/**
 * Returns an object of edited post attributes for the site ID post ID pairing.
 *
 * @param   {object} state  Global state tree
 * @param   {number} siteId Site ID
 * @param   {number} postId Post ID
 * @returns {object}        Post revisions
 */
export const getPostEdits = createSelector(
	( state, siteId, postId ) => {
		const postEditsLog = get( state.posts.edits, [ siteId, postId || '' ] );
		if ( ! postEditsLog ) {
			return null;
		}

		return normalizePostForEditing( mergePostEdits( ...postEditsLog ) );
	},
	( state ) => [ state.posts.edits ]
);
