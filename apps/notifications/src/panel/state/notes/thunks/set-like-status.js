import { recordTracksEvent } from '../../../helpers/stats';
import { wpcom } from '../../../rest-client/wpcom';
import { likeNote } from '../actions';
import bumpStat from '../utils/bump-stat';

const setLikeStatus =
	( noteId, siteId, postId, commentId, isLiked, restClient ) => async ( dispatch ) => {
		const type = commentId ? 'comment' : 'post';
		dispatch( likeNote( noteId, isLiked ) );
		bumpStat( `${ isLiked ? 'unlike' : 'like' }-${ type }` );
		recordTracksEvent( 'calypso_notification_note_' + ( isLiked ? 'like' : 'unlike' ), {
			note_type: type,
		} );

		const entityPath = type === 'comment' ? `comments/${ commentId }` : `posts/${ postId }`;
		if ( isLiked ) {
			await wpcom().req.post( `/sites/${ siteId }/${ entityPath }/likes/new` );
		} else {
			await wpcom().req.del( `/sites/${ siteId }/${ entityPath }/likes/mine/delete` );
		}

		// getNote() updates the redux store with a fresh object from the API
		restClient.getNote( noteId );
	};

export default setLikeStatus;
