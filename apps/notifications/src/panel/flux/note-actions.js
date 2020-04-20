/**
 * External dependencies
 */
import { store as reduxStore } from '../state/';
import actions from '../state/actions';

import { wpcom } from '../rest-client/wpcom';
import store from './store';
import { bumpStat as rawBumpStat } from '../rest-client/bump-stat';

const { recordTracksEvent } = require( '../helpers/stats' );

function bumpStat( name ) {
	rawBumpStat( 'notes-click-action', name );
}

function updateNote( id ) {
	const globalClient = store.get( 'global' ).client;

	return () => globalClient.getNote( id );
}

export const setApproveStatus = function ( noteId, siteId, commentId, isApproved, type ) {
	const comment = wpcom().site( siteId ).comment( commentId );

	reduxStore.dispatch( actions.notes.approveNote( noteId, isApproved ) );
	bumpStat( isApproved ? 'unapprove-comment' : 'approve-comment' );
	recordTracksEvent( 'calypso_notification_note_' + ( isApproved ? 'approve' : 'unapprove' ), {
		note_type: type,
	} );

	comment.update( { status: isApproved ? 'approved' : 'unapproved' }, updateNote( noteId ) );
};

export const setLikeStatus = function ( noteId, siteId, postId, commentId, isLiked ) {
	const type = commentId ? 'comment' : 'post';
	const target =
		'comment' === type
			? wpcom().site( siteId ).comment( commentId )
			: wpcom().site( siteId ).post( postId );

	reduxStore.dispatch( actions.notes.likeNote( noteId, isLiked ) );
	bumpStat( `${ isLiked ? 'unlike' : 'like'}-${ type }` );
	recordTracksEvent( 'calypso_notification_note_' + ( isLiked ? 'like' : 'unlike' ), {
		note_type: type,
	} );

	return isLiked
		? target.like().add( updateNote( noteId ) )
		: target.like().del( updateNote( noteId ) );
};

export const spamNote = function ( note ) {
	const global = store.get( 'global' );

	bumpStat( 'spam-comment' );
	recordTracksEvent( 'calypso_notification_note_spam', {
		note_type: note.type,
	} );

	reduxStore.dispatch( actions.notes.spamNote( note.id ) );
	global.updateUndoBar( 'spam', note );
};

export const trashNote = function ( note ) {
	const global = store.get( 'global' );

	bumpStat( 'trash-comment' );
	recordTracksEvent( 'calypso_notification_note_trash', {
		note_type: note.type,
	} );

	reduxStore.dispatch( actions.notes.trashNote( note.id ) );
	global.updateUndoBar( 'trash', note );
};
