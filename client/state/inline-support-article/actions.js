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
	if ( window.history?.pushState ) {
		const searchParams = new URLSearchParams( window.location.search );
		searchParams.set( 'support-article', postId );
		const newUrl = window.location.pathname + '?' + decodeURIComponent( searchParams.toString() );

		// Adds a back button but nothing else changes.
		window.history.pushState( { postId }, '', newUrl );
	}
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
	if ( window.history?.pushState ) {
		const searchParams = new URLSearchParams( window.location.search );
		searchParams.delete( 'support-article' );
		const newUrl =
			window.location.pathname +
			( searchParams.toString() ? '?' + decodeURIComponent( searchParams.toString() ) : '' );
		// Adds a back button but nothing else changes.
		window.history.pushState( null, '', newUrl );
	}
	return { type: SUPPORT_ARTICLE_DIALOG_CLOSE };
}
