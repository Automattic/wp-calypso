import * as types from '../action-types';

/**
 * @param {Object[]} notes notes from the server
 * @param {number} [requestedAt] when the request that returned them was sent, in ms
 */
export const addNotes = ( notes, requestedAt ) => ( {
	type: types.NOTES_ADD,
	notes,
	requestedAt,
} );

export const removeNotes = ( noteIds, isComment = false ) => ( {
	type: types.NOTES_REMOVE,
	noteIds,
	isComment,
} );

// Replace one filtered view's id list, keyed by filter. This only sets the list;
// note content lives in `allNotes` and is unaffected.
export const setFilteredNoteIds = ( filterKey, noteIds ) => ( {
	type: types.SET_FILTERED_NOTE_IDS,
	filterKey,
	noteIds,
} );

export const noteAction = ( action ) => ( noteId ) => ( {
	type: action,
	noteId,
} );

export const readNote = noteAction( types.READ_NOTE );
export const readNotes = ( noteIds ) => ( {
	type: types.READ_NOTES,
	noteIds,
} );
export const spamNote = noteAction( types.SPAM_NOTE );
export const trashNote = noteAction( types.TRASH_NOTE );
export const unreadNote = noteAction( types.UNREAD_NOTE );

export const approveNote = ( noteId, isApproved ) => ( {
	type: types.APPROVE_NOTE,
	noteId,
	isApproved,
} );

export const likeNote = ( noteId, isLiked ) => ( {
	type: types.LIKE_NOTE,
	noteId,
	isLiked,
} );

/**
 * Resets the local cache overrride on note approval status
 *
 * When a note is locally approved we cache an override in
 * the app so that stale data coming in from polling
 * operations don't accidentally change this value to
 * an incorrect state and cause a flash of the approval status.
 * @see approveNote
 * @param {number} noteId
 * @returns {Object} action object
 */
export const resetLocalApproval = ( noteId ) => ( {
	type: types.RESET_LOCAL_APPROVAL,
	noteId,
} );

/**
 * Resets the local cache overrride on note like status
 *
 * When a note is locally liked we cache an override in
 * the app so that stale data coming in from polling
 * operations don't accidentally change this value to
 * an incorrect state and cause a flash of the like status.
 * @see likeNote
 * @param {number} noteId
 * @returns {Object} action object
 */
export const resetLocalLike = ( noteId ) => ( {
	type: types.RESET_LOCAL_LIKE,
	noteId,
} );

/**
 * Resets the local cache override on note read status
 *
 * A note marked as read or unread here keeps that status over
 * whatever the server sends. Resetting it lets the server's
 * `read` field decide again.
 * @param {number} noteId
 * @returns {Object} action object
 */
export const resetLocalRead = ( noteId ) => ( {
	type: types.RESET_LOCAL_READ,
	noteId,
} );

export default {
	addNotes,
	approveNote,
	likeNote,
	readNote,
	readNotes,
	removeNotes,
	resetLocalApproval,
	resetLocalLike,
	resetLocalRead,
	setFilteredNoteIds,
	spamNote,
	trashNote,
	unreadNote,
};
