import {
	SUPPORT_ARTICLE_DIALOG_OPEN,
	SUPPORT_ARTICLE_DIALOG_CLOSE,
} from 'calypso/state/action-types';

import 'calypso/state/inline-support-article/init';
/**
 * Update the url to contain 'support-article'
 *
 * @param {number} postId
 */
function updateUrl( postId = null ) {
	if ( ! window.history || ! URLSearchParams ) {
		return;
	}

	const searchParams = new URLSearchParams( window.location.search );
	let historyObject = null;
	let newQuery = '';

	if ( postId ) {
		searchParams.set( 'support-article', postId );
		historyObject = { postId };
	} else {
		searchParams.delete( 'support-article' );
	}

	if ( searchParams.toString() ) {
		newQuery = '?' + decodeURIComponent( searchParams.toString() );
	}

	const newUrl = window.location.pathname + newQuery;
	window.history.pushState( historyObject, '', newUrl );
}

/**
 * Shows the given support article (by postId) in a dialog.
 *
 * @param {object} options             Action options
 * @param {number} options.postId      The id of the support article
 * @param {string} options.postUrl     The URL of the support article
 * @param {string} options.actionLabel Label of the action
 * @param {string} options.actionUrl   URL of the action
 * @param {number} options.blogId      The blog id of the support article
 * @returns {object}		Action
 */
export function openSupportArticleDialog( {
	postId,
	postUrl = null,
	actionLabel = null,
	actionUrl = null,
	blogId = null,
} ) {
	updateUrl( postId );
	return {
		type: SUPPORT_ARTICLE_DIALOG_OPEN,
		postId,
		postUrl,
		actionLabel,
		actionUrl,
		blogId,
	};
}

/**
 * Closes/hides the support article dialog
 *
 * @returns {object}		Action
 */
export function closeSupportArticleDialog() {
	updateUrl();
	return { type: SUPPORT_ARTICLE_DIALOG_CLOSE };
}
