import type { AppState } from 'calypso/types';

import 'calypso/state/editor/init';

/**
 * Returns the current editor post ID, or `null` if a new post.
 * @param  {Object} state Global state tree
 * @returns {?number}      Current editor post ID
 */
export function getEditorPostId( state: AppState ): number | undefined {
	return state.editor.postId;
}
