/**
 * Internal dependencies
 */
import { SUPPORT_ARTICLE_DIALOG_OPEN, SUPPORT_ARTICLE_DIALOG_CLOSE } from 'state/action-types';

/**
 * Shows the given support article (by postId) in a dialog.
 *
 * @param  {number} postId 	The id of the support article
 * @param  {string} postUrl	The URL of the support article
 *
 * @returns {Function}		Action thunk
 */
export function openSupportArticleDialog( { postId, postUrl = null } ) {
	return dispatch => {
		dispatch( {
			type: SUPPORT_ARTICLE_DIALOG_OPEN,
			postId,
			postUrl,
		} );
	};
}

/**
 * Closes/hides the support article dialog
 *
 * @returns {Function}		Action thunk
 */
export function closeSupportArticleDialog() {
	return dispatch => dispatch( { type: SUPPORT_ARTICLE_DIALOG_CLOSE } );
}
