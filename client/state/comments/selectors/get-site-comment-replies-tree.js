/**
 * External dependencies
 */
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSiteCommentsTree } from 'state/comments/selectors';

import 'state/comments/init';

export const getSiteCommentRepliesTree = createSelector(
	( state, siteId, status, commentParentId ) =>
		filter( getSiteCommentsTree( state, siteId, status ), { commentParentId } ),
	( state, siteId ) => [ state.comments.trees[ siteId ] ]
);
