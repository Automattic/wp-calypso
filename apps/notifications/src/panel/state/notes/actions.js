import * as types from '../action-types';

export const addNotes = ( notes ) => ( {
	type: types.NOTES_ADD,
	notes,
} );

export const removeNotes = ( noteIds ) => ( {
	type: types.NOTES_REMOVE,
	noteIds,
} );

export const noteAction = ( action ) => ( noteId ) => ( {
	type: action,
	noteId,
} );

export const readNote = noteAction( types.READ_NOTE );
export const spamNote = noteAction( types.SPAM_NOTE );
export const trashNote = noteAction( types.TRASH_NOTE );

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
 *
 * @see approveNote
 *
 * @param {number} noteId
 * @returns {object} action object
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
 *
 * @see likeNote
 *
 * @param {number} noteId
 * @returns {object} action object
 */
export const resetLocalLike = ( noteId ) => ( {
	type: types.RESET_LOCAL_LIKE,
	noteId,
} );

export default {
	addNotes,
	approveNote,
	likeNote,
	readNote,
	removeNotes,
	resetLocalApproval,
	resetLocalLike,
	spamNote,
	trashNote,
};
