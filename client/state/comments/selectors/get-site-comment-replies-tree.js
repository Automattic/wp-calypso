import { createSelector } from '@automattic/state-utils';
import { filter } from 'lodash';
import { getSiteCommentsTree } from 'calypso/state/comments/selectors';

import 'calypso/state/comments/init';

export const getSiteCommentRepliesTree = createSelector(
	( state, siteId, status, commentParentId ) =>
		filter( getSiteCommentsTree( state, siteId, status ), { commentParentId } ),
	( state, siteId ) => [ state.comments.trees[ siteId ] ]
);
