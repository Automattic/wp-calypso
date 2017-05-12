/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import debug from 'debug';
import { mergeHandlers } from 'state/data-layer/utils';
import {
	DISCUSSIONS_REQUEST,
	DISCUSSIONS_ITEM_LIKE_REQUEST,
	DISCUSSIONS_ITEM_UNLIKE_REQUEST,
} from 'state/action-types';
import {
	requestingPostComments,
	receivePostComments,
	successPostCommentsRequest,
	failPostCommentsRequest,
	receivePostCommentsCount,
} from 'state/discussions/actions';
import {
	requestCommentLike,
	requestCommentUnLike
} from './likes';
import status from './status';
import content from './content';

/**
 * Module variables
 */
const log = debug( 'calypso:middleware-comments' );

 /**
  * Dispatches a request to fetch all available discussions for a post with query options
  *
	* @param   {Function} dispatch Redux dispatcher
  * @param   {Object}   action   Redux action
  * @param   {Function} next     data-layer-bypassing dispatcher
  * @returns {Promise}           Promise
  */
export const requestDiscussions = ( { dispatch }, action ) => {
	const {
		siteId,
		postId,
		status
	} = action;

	log( 'Request discussions for post %d on site %d using status %o', postId, siteId, status );

	dispatch( requestingPostComments( siteId, postId, status ) );

	return wpcom.site( siteId )
		.post( postId )
		.comment()
		.replies( { status } )
		.then( ( { comments, found } ) => {
			dispatch( receivePostComments( siteId, comments ) );
			dispatch( successPostCommentsRequest( siteId, postId, status ) );
			dispatch( receivePostCommentsCount( siteId, postId, found ) );
		} )
		.catch( error => dispatch( failPostCommentsRequest( siteId, postId, status, error ) ) );
};

const discussions = {
	[ DISCUSSIONS_REQUEST ]: [ requestDiscussions ],
	[ DISCUSSIONS_ITEM_LIKE_REQUEST ]: [ requestCommentLike ],
	[ DISCUSSIONS_ITEM_UNLIKE_REQUEST ]: [ requestCommentUnLike ],
};

export default mergeHandlers(
	content,
	discussions,
	status
);
