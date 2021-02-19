/**
 * Internal dependencies
 */
import { getEditedPost } from 'calypso/state/posts/selectors';

import 'calypso/state/editor/init';

/**
 * Returns the edited post object for the last draft post, or null if there is
 * no last draft.
 *
 * @param  {object} state Global state tree
 * @returns {object}       Last edited draft
 */
export function getEditorLastDraftPost( state ) {
	const siteId = getEditorLastDraftSiteId( state );
	const postId = getEditorLastDraftPostId( state );
	if ( ! siteId || ! postId ) {
		return null;
	}
	return getEditedPost( state, siteId, postId );
}

/**
 * Returns the last edited draft site ID, or null if there is no last draft.
 *
 * @param  {object}  state Global state tree
 * @returns {?number}       Last edited draft site ID
 */
export function getEditorLastDraftSiteId( state ) {
	return state.editor.lastDraft.siteId;
}

/**
 * Returns the last edited draft post ID, or null if there is no last draft.
 *
 * @param  {object}  state Global state tree
 * @returns {?number}       Last edited draft post ID
 */
export function getEditorLastDraftPostId( state ) {
	return state.editor.lastDraft.postId;
}
