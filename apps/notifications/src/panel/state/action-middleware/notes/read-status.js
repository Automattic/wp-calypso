import { reportError, reportRequestError } from '../../../helpers/log-error';
import { bumpStat } from '../../../rest-client/bump-stat';
import { isReadStatusPending, markReadStatus, markPostAsSeen } from '../../../rest-client/wpcom';
import * as types from '../../action-types';
import { resetLocalRead } from '../../notes/actions';
import getIsNoteRead from '../../selectors/get-is-note-read';
import getNote from '../../selectors/get-note';
import getNotes from '../../selectors/get-notes';

/** @type {number} number of ms a note marked as unread ignores what the server sends */
const LOCAL_UNREAD_PERSISTENCE = 10000;

const localUnreadHolds = {};

const clearLocalReadCache = ( noteId ) => {
	try {
		localStorage.removeItem( `note_read_status_${ noteId }` );
	} catch ( e ) {}
};

// Clear the local cache of read status
// if we get updated data from the server
export const clearReadCache = ( store, action ) => {
	const noteIds = action.notes ? action.notes.map( ( { id } ) => id ) : action.noteIds;

	noteIds.forEach( clearLocalReadCache );
};

// A response fetched before the note was marked as unread can land after it,
// so hold the local status for a while, like the like and approval overrides.
export const holdLocalUnread = ( store, { noteId } ) => {
	localUnreadHolds[ noteId ] = Date.now() + LOCAL_UNREAD_PERSISTENCE;
};

// A copy of the note requested after the hold is over decides its read status
// again, so a note read elsewhere stops showing as unread here.
// Only unread overrides are released: read ones keep working as before.
export const releaseLocalUnreads = (
	{ dispatch, getState },
	{ notes, requestedAt = Date.now() }
) => {
	const { noteReads } = getNotes( getState() );

	notes.forEach( ( { id } ) => {
		if ( noteReads[ id ] !== false ) {
			delete localUnreadHolds[ id ];
			return;
		}
		if ( requestedAt < ( localUnreadHolds[ id ] ?? 0 ) || isReadStatusPending( id ) ) {
			return;
		}
		delete localUnreadHolds[ id ];
		dispatch( resetLocalRead( id ) );
	} );
};

export const markAsRead = ( { getState }, { noteId } ) => {
	const state = getState();
	const note = getNote( state, noteId );

	if ( ! note || getIsNoteRead( state, note ) ) {
		return;
	}

	const isSeenSupportedType = note.type === 'automattcher' || note.type === 'new_post';
	const hasRequiredIds = note.meta && note.meta.ids && note.meta.ids.site && note.meta.ids.post;
	if ( isSeenSupportedType && hasRequiredIds ) {
		// Mark post as seen if notification is open.
		markPostAsSeen( note.meta.ids.site, note.meta.ids.post );
	}

	// If the note hasn't yet been marked as read then mark it
	try {
		localStorage.setItem( `note_read_status_${ noteId }`, '1' );
	} catch ( e ) {}

	bumpStat( 'notes-read-type', note.type );

	markReadStatus( noteId, true, ( error, data ) => {
		if ( error || ! data.success ) {
			if ( error ) {
				reportRequestError( 'read', error );
			} else {
				reportError( 'read', data );
			}
			try {
				return localStorage.removeItem( `note_read_status_${ noteId }` );
			} catch ( e ) {}
		}

		if ( ! getIsNoteRead( getState(), note ) ) {
			return;
		}

		try {
			localStorage.setItem( `note_read_status_${ noteId }`, '1' );
		} catch ( e ) {}
	} );
};

export default {
	[ types.NOTES_ADD ]: [ clearReadCache, releaseLocalUnreads ],
	[ types.NOTES_REMOVE ]: [ clearReadCache ],
	[ types.SELECT_NOTE ]: [ markAsRead ],
	[ types.UNREAD_NOTE ]: [ holdLocalUnread ],
};
