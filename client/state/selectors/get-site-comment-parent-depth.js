/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getSiteComment from 'state/selectors/get-site-comment';

import 'state/comments/init';

export const getSiteCommentParentDepth = createSelector(
	( state, siteId, commentId ) => {
		const comment = getSiteComment( state, siteId, commentId );
		const parentId = get( comment, [ 'parent', 'ID' ], 0 );

		if ( ! comment ) {
			return 0;
		}

		return parentId ? 1 + getSiteCommentParentDepth( state, siteId, parentId ) : 0;
	},
	( state, siteId ) => [ get( state, [ 'comments', 'trees', siteId ] ) ]
);

export default getSiteCommentParentDepth;
