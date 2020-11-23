/**
 * Internal dependencies
 */
import { likeNote } from '../actions';
import { wpcom } from '../../../rest-client/wpcom';
import { recordTracksEvent } from '../../../helpers/stats';
import bumpStat from '../utils/bump-stat';

// getNote() updates the redux store with a fresh object from the API
const updateNote = ( noteId, restClient ) => restClient.getNote( noteId );

const setLikeStatus = ( noteId, siteId, postId, commentId, isLiked, restClient ) => (
	dispatch
) => {
	const type = commentId ? 'comment' : 'post';
	const target =
		'comment' === type
			? wpcom().site( siteId ).comment( commentId )
			: wpcom().site( siteId ).post( postId );

	dispatch( likeNote( noteId, isLiked ) );
	bumpStat( `${ isLiked ? 'unlike' : 'like' }-${ type }` );
	recordTracksEvent( 'calypso_notification_note_' + ( isLiked ? 'like' : 'unlike' ), {
		note_type: type,
	} );

	return isLiked
		? target.like().add( updateNote( noteId, restClient ) )
		: target.like().del( updateNote( noteId, restClient ) );
};

export default setLikeStatus;
