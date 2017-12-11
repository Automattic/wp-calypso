/** @format */
/**
 * External dependencies
 */
import { filter, get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSiteCommentsTree } from 'state/selectors';

export const getSiteCommentRepliesTree = createSelector(
	( state, siteId, status, commentParentId ) =>
		filter( getSiteCommentsTree( state, siteId, status ), { commentParentId } ),
	( state, siteId ) => [ get( state, [ 'comments', 'trees', siteId ] ) ]
);

export default getSiteCommentRepliesTree;
