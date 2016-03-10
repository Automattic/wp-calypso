/**
 * Returns the current editor post ID, or `null` if a new post.
 *
 * @param  {Object}  state Global state tree
 * @return {?Number}       Current editor post ID
 */
export function getEditorPostId( state ) {
	return state.ui.editor.postId;
}

/**
 * Returns whether editing a new post in the post editor.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether editing new post in editor
 */
export function isEditorNewPost( state ) {
	return ! getEditorPostId( state );
}
