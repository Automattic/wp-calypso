/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import debug from 'debug';
import {
	requestingCommentContentUpdate,
	successCommentContentUpdateRequest,
	failCommentContentUpdateRequest,
} from 'state/discussions/actions';

/**
 * Module variables
 */
const log = debug( 'calypso:middleware-comments:content' );

 /**
  * Dispatches a request update the content of a comment
  *
	* @param   {Function} dispatch Redux dispatcher
  * @param   {Object}   action   Redux action
  * @returns {Promise}           Promise
  */
export const requestCommentContentUpdate = ( { dispatch }, action ) => {
	const {
		siteId,
		commentId,
		content
	} = action;

	log( 'Request content update for comment %d on site %d using content %o', commentId, siteId, content );

	dispatch( requestingCommentContentUpdate( siteId, commentId ) );

	return wpcom.site( siteId )
		.comment( commentId )
		.update( { content } )
		.then( () => {
			dispatch( successCommentContentUpdateRequest( siteId, commentId, content ) );
		} )
		.catch( error => dispatch( failCommentContentUpdateRequest( siteId, commentId, content, error ) ) );
};
