/**
 * External dependencies
 */
import { likeNote } from '../actions';

import { wpcom } from '../../../rest-client/wpcom';
import { bumpStat as rawBumpStat } from '../../../rest-client/bump-stat';

const { recordTracksEvent } = require( '../../../helpers/stats' );

function bumpStat( name ) {
	rawBumpStat( 'notes-click-action', name );
}

const setLikeStatus = ( noteId, siteId, postId, commentId, isLiked, client ) => ( dispatch ) => {
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
		? target.like().add( () => client.getNote( noteId ) )
		: target.like().del( () => client.getNote( noteId ) );
};

export default setLikeStatus;
