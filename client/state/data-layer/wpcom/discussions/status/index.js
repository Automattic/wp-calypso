/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import debug from 'debug';
import {
	requestingCommentStatusUpdate,
	successCommentStatusUpdateRequest,
	failCommentStatusUpdateRequest,
} from 'state/discussions/actions';

/**
 * Module variables
 */
const log = debug( 'calypso:middleware-comments:status' );

 /**
  * Dispatches a request to update the status of a comment
  *
  * @param   {Function} dispatch Redux dispatcher
  * @param   {Object}   action   Redux action
  * @returns {Promise}           Promise
  */
export const requestCommentStatusUpdate = ( { dispatch }, action ) => {
	const {
		siteId,
		commentId,
		status
	} = action;

	log( 'Request status update for comment %d on site %d using status %o', commentId, siteId, status );

	dispatch( requestingCommentStatusUpdate( siteId, commentId ) );

	return wpcom.site( siteId )
		.comment( commentId )
		.update( { status } )
		.then( () => {
			dispatch( successCommentStatusUpdateRequest( siteId, commentId, status ) );
		} )
		.catch( error => dispatch( failCommentStatusUpdateRequest( siteId, commentId, status, error ) ) );
};
