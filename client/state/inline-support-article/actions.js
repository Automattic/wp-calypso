/**
 * Internal dependencies
 */
import { SUPPORT_ARTICLE_DIALOG_OPEN, SUPPORT_ARTICLE_DIALOG_CLOSE } from 'state/action-types';

/**
 * Shows the given support article (by postId) in a dialog.
 *
 * @param {object} options - action options
 * 	{number} postId 	The id of the support article
 *  {string} postUrl	The URL of the support article
 *
 * @returns {object}		Action
 */
export function openSupportArticleDialog( {
	postId,
	postUrl = null,
	actionLabel = null,
	actionUrl = null,
} ) {
	return {
		type: SUPPORT_ARTICLE_DIALOG_OPEN,
		postId,
		postUrl,
		actionLabel,
		actionUrl,
	};
}

/**
 * Closes/hides the support article dialog
 *
 * @returns {object}		Action
 */
export function closeSupportArticleDialog() {
	return { type: SUPPORT_ARTICLE_DIALOG_CLOSE };
}
