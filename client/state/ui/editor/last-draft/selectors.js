/** @format */
/**
 * Internal dependencies
 */
import { getEditedPost } from 'state/posts/selectors';

/**
 * Returns the edited post object for the last draft post, or null if there is
 * no last draft.
 *
 * @param  {Object} state Global state tree
 * @return {Object}       Last edited draft
 */
export function getEditorLastDraftPost( state ) {
	const siteId = getEditorLastDraftSiteId( state );
	const postId = getEditorLastDraftPostId( state );
	return getEditedPost( state, siteId, postId );
}

/**
 * Returns the last edited draft site ID, or null if there is no last draft.
 *
 * @param  {Object}  state Global state tree
 * @return {?Number}       Last edited draft site ID
 */
export function getEditorLastDraftSiteId( state ) {
	return state.ui.editor.lastDraft.siteId;
}

/**
 * Returns the last edited draft post ID, or null if there is no last draft.
 *
 * @param  {Object}  state Global state tree
 * @return {?Number}       Last edited draft post ID
 */
export function getEditorLastDraftPostId( state ) {
	return state.ui.editor.lastDraft.postId;
}
