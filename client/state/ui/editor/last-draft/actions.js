/** @format */
/**
 * Internal dependencies
 */
import { EDITOR_LAST_DRAFT_SET } from 'state/action-types';

/**
 * Returns an action object signalling that the editor last draft should be set
 * to the specified site ID, post ID pair.
 *
 * @param  {Number} siteId Site ID
 * @param  {Number} postId Post ID
 * @return {Object} Action object
 */
export function setEditorLastDraft( siteId, postId ) {
	return {
		type: EDITOR_LAST_DRAFT_SET,
		siteId,
		postId,
	};
}

/**
 * Returns an action object signalling that the editor last draft should be
 * unassigned.
 *
 * @return {Object} Action object
 */
export function resetEditorLastDraft() {
	return setEditorLastDraft( null, null );
}
