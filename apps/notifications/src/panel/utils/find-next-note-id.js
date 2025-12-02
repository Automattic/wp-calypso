/**
 * Returns the next index into a list of notes following
 * the index for the given sought-after notification id
 * @param {!number} noteId id of note to search for
 * @param {!Array<Notification>} notes list of notes to search through
 * @returns {?number} index into note list of note following that given by noteId
 */
const findNextNoteId = ( noteId, notes ) => {
	if ( notes.length === 0 ) {
		return null;
	}

	const index = notes.indexOf( noteId );
	if ( -1 === index ) {
		return null;
	}

	const nextIndex = index + 1;
	if ( nextIndex >= notes.length ) {
		return null;
	}

	return notes[ nextIndex ].id;
};

export default findNextNoteId;
