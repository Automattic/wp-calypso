import { SUPPORT_ARTICLE_DIALOG_CLOSE } from 'calypso/state/action-types';

import 'calypso/state/inline-support-article/init';

/**
 * Closes/hides the support article dialog
 * @returns {Object}		Action
 */
export function closeSupportArticleDialog() {
	return { type: SUPPORT_ARTICLE_DIALOG_CLOSE };
}
