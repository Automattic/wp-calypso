/** @format */

/**
 * External dependencies
 */

import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSite, getSiteSlug } from 'state/sites/selectors';
import { getEditedPost, getSitePost } from 'state/posts/selectors';
import { getPreference } from 'state/preferences/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import { isPublished, isBackDatedPublished, isFutureDated, getPreviewURL } from 'state/posts/utils';
import getEditorUrl from 'state/selectors/get-editor-url';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';

/**
 * Returns the current editor post ID, or `null` if a new post.
 *
 * @param  {Object} state Global state tree
 * @return {?Number}      Current editor post ID
 */
export function getEditorPostId( state ) {
	return state.ui.editor.postId;
}

/**
 * Returns whether editing a new post in the post editor.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether editing new post in editor
 */
export function isEditorNewPost( state ) {
	return ! getEditorPostId( state );
}

/**
 * Returns the editor URL for duplicating a given site ID, post ID pair.
 *
 * @param  {Object} state       Global state tree
 * @param  {Number} siteId      Site ID
 * @param  {Number} postId      Post ID
 * @param  {String} type        Post type
 * @return {String}             Editor URL path
 */
export function getEditorDuplicatePostPath( state, siteId, postId, type = 'post' ) {
	const editorNewPostPath = getEditorUrl( state, siteId, null, type );
	return `${ editorNewPostPath }?copy=${ postId }`;
}

/**
 * Returns the editor URL of a Calypsoified site for duplicating a given site ID, post ID pair.
 *
 * @param  {Object} state       Global state tree
 * @param  {Number} siteId      Site ID
 * @param  {Number} postId      Post ID
 * @param  {String} type        Post type
 * @return {String}             Editor URL path
 */
export function getCalypsoifyEditorDuplicatePostPath( state, siteId, postId, type = 'post' ) {
	const gutenbergEditorUrl = getGutenbergEditorUrl( state, siteId, null, type );
	return `${ gutenbergEditorUrl }&jetpack-copy=${ postId }`;
}

/**
 * Returns the editor new post URL path for the given site ID and type.
 *
 * @param  {Object} state       Global state tree
 * @param  {Number} siteId      Site ID
 * @param  {Number} type        Post type
 * @return {String}             Editor URL path
 */
export function getEditorNewPostPath( state, siteId, type = 'post' ) {
	let path;
	switch ( type ) {
		case 'post':
			path = '/post';
			break;
		case 'page':
			path = '/page';
			break;
		default:
			path = `/edit/${ type }`;
			break;
	}

	const siteSlug = getSiteSlug( state, siteId );
	if ( siteSlug ) {
		path += `/${ siteSlug }`;
	} else {
		path += `/${ siteId }`;
	}

	return path;
}

/**
 * Returns the editor URL path for the given site ID, post ID pair.
 *
 * @param  {Object} state       Global state tree
 * @param  {Number} siteId      Site ID
 * @param  {Number} postId      Post ID
 * @param  {String} defaultType Fallback post type if post not found
 * @return {String}             Editor URL path
 */
export function getEditorPath( state, siteId, postId, defaultType = 'post' ) {
	if ( ! siteId ) {
		return '/post';
	}
	const editedPost = getEditedPost( state, siteId, postId );
	const type = get( editedPost, 'type', defaultType );
	let path = getEditorNewPostPath( state, siteId, type );

	if ( postId ) {
		path += `/${ postId }`;
	}

	return path;
}

/**
 * Returns whether the confirmation sidebar is enabled for the given siteId
 *
 * @param  {Object}  state     Global state tree
 * @param  {Number}  siteId    Site ID
 * @return {Boolean}           Whether or not the sidebar is enabled
 */
export function isConfirmationSidebarEnabled( state, siteId ) {
	return getPreference( state, 'editorConfirmationDisabledSites' ).indexOf( siteId ) === -1;
}

/*
 * Returns whether editor save is currently blocked for some reason identified by `key`.
 * If `key` is not specified, returns whether save is blocked for any reason.
 */
export function isEditorSaveBlocked( state, key ) {
	const { saveBlockers } = state.ui.editor;

	if ( ! key ) {
		return !! saveBlockers.length;
	}

	return includes( saveBlockers, key );
}

export function getEditorPostPreviewUrl( state ) {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const site = getSite( state, siteId );
	const post = getSitePost( state, siteId, postId );
	return getPreviewURL( site, post, state.ui.editor.autosavePreviewUrl );
}

export function isEditorAutosaving( state ) {
	return state.ui.editor.isAutosaving;
}

export function isEditorLoading( state ) {
	return state.ui.editor.isLoading;
}

export function getEditorPublishButtonStatus( state ) {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const currentPost = getSitePost( state, siteId, postId );
	const editedPost = getEditedPost( state, siteId, postId );
	const canUserPublishPosts = canCurrentUser( state, siteId, 'publish_posts' );

	// Return `null` (means "unknown") if the site or the post to edit is not available.
	// Typically happens when async-loading them is in progress.
	if ( ! siteId || ! editedPost ) {
		return null;
	}

	if (
		( isPublished( currentPost ) &&
			! isBackDatedPublished( currentPost ) &&
			! isFutureDated( editedPost ) ) ||
		( currentPost && currentPost.status === 'future' && isFutureDated( editedPost ) )
	) {
		return 'update';
	}

	if ( isFutureDated( editedPost ) ) {
		return 'schedule';
	}

	if ( canUserPublishPosts ) {
		return 'publish';
	}

	if ( currentPost && currentPost.status === 'pending' ) {
		return 'update';
	}

	return 'requestReview';
}

export function getEditorInitialRawContent( state ) {
	return state.ui.editor.rawContent.initial;
}

export function getEditorRawContent( state ) {
	return state.ui.editor.rawContent.current;
}

export function getEditorLoadingError( state ) {
	return state.ui.editor.loadingError;
}
