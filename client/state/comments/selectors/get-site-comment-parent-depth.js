/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSiteComment } from 'state/comments/selectors';

import 'state/comments/init';

export const getSiteCommentParentDepth = createSelector(
	( state, siteId, commentId ) => {
		const comment = getSiteComment( state, siteId, commentId );
		const parentId = comment?.parent?.ID ?? 0;

		if ( ! comment ) {
			return 0;
		}

		return parentId ? 1 + getSiteCommentParentDepth( state, siteId, parentId ) : 0;
	},
	( state, siteId ) => [ state.comments.trees[ siteId ] ]
);

export default getSiteCommentParentDepth;
