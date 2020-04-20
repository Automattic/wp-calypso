/**
 * Returns last block in list of blocks with 'actions' property
 */
function getActionBlock( blocks ) {
	return blocks.filter( ( block ) => block.hasOwnProperty( 'actions' ) ).slice( -1 )[ 0 ] || {};
}

/**
 * Returns an object specifying which actions are enabled for a note and their values
 *
 * @param note
 * @returns {object}
 */
export function getActions( note ) {
	return getActionBlock( note.body ).actions;
}

/**
 * Returns an id for a type of reference in a note or null
 *
 * @param note
 * @param {string} type can be 'post', 'comment', 'site', etc...
 * @returns {number|null} null if no reference of type is found
 */
export function getReferenceId( note, type ) {
	if ( ! ( note.meta && note.meta.ids && note.meta.ids[ type ] ) ) {
		return null;
	}

	return note.meta.ids[ type ];
}

/**
 * Returns the edit link for the note comment.
 * It's a Calypso link for WP.com sites and
 * Jetpack sites with the `edit_links_calypso_redirect` option set.
 * It's a wp-admin link otherwise.
 *
 * @param note
 * @returns {string}
 */
export function getEditCommentLink( note ) {
	return getActionBlock( note.body ).edit_comment_link;
}
