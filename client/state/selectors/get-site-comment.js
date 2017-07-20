/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteComments from 'state/selectors/get-site-comments';

export const getSiteComment = ( state, siteId, commentId ) => {
	const comments = getSiteComments( state, siteId );
	return find( comments, { ID: commentId } );
};

export default getSiteComment;
