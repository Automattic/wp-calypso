/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import debug from 'debug';
import {
	requestingCommentLike,
	sucessCommentLikeRequest,
	failCommentLikeRequest,
} from 'state/discussions/actions';

/**
 * Module variables
 */
const log = debug( 'calypso:middleware-comments:likes' );

 /**
  * Dispatches a request to like a comment
  *
	* @param   {Function} dispatch Redux dispatcher
  * @param   {Object}   action   Redux action
  * @returns {Promise}           Promise
  */
export const requestCommentLike = ( { dispatch }, action ) => {
	const {
		siteId,
		commentId,
		source
	} = action;

	log( 'Request like for comment %d on site %d using source %o', commentId, siteId, source );

	dispatch( requestingCommentLike( siteId, commentId, source ) );

	return wpcom.site( siteId )
		.comment( commentId )
		.like()
		.add( { source } )
		.then( ( { i_like, like_count } ) => {
			dispatch( sucessCommentLikeRequest( siteId, commentId, source, i_like, like_count ) );
		} )
		.catch( error => dispatch( failCommentLikeRequest( siteId, commentId, source, error ) ) );
};

/**
 * Dispatches a request to unlike a comment
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @returns {Promise}           Promise
 */
export const requestCommentUnLike = ( { dispatch }, action ) => {
	const {
		siteId,
		commentId,
		source
	} = action;

	log( 'Request unlike for comment %d on site %d using source %o', commentId, siteId, source );

	dispatch( requestingCommentLike( siteId, commentId, source ) );

	return wpcom.site( siteId )
		.comment( commentId )
		.like()
		.del( { source } )
		.then( ( { i_like, like_count } ) => {
			dispatch( sucessCommentLikeRequest( siteId, commentId, source, i_like, like_count ) );
		} )
		.catch( error => dispatch( failCommentLikeRequest( siteId, commentId, source, error ) ) );
};
