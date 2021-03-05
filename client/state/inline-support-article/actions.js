/**
 * Internal dependencies
 */
import {
	SUPPORT_ARTICLE_DIALOG_OPEN,
	SUPPORT_ARTICLE_DIALOG_CLOSE,
} from 'calypso/state/action-types';

import 'calypso/state/inline-support-article/init';

/**
 * Shows the given support article (by postId) in a dialog.
 *
 * @param {object} options             Action options
 * @param {number} options.postId      The id of the support article
 * @param {string} options.postUrl     The URL of the support article
 * @param {string} options.actionLabel Label of the action
 * @param {string} options.actionUrl   URL of the action
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
