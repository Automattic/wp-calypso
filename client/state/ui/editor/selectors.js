/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteSlug } from 'state/sites/selectors';
import { getEditedPost } from 'state/posts/selectors';
import { getPreference } from 'state/preferences/selectors';

/**
 * Returns the current editor post ID, or `null` if a new post.
 *
 * @param  {Object}  state Global state tree
 * @return {?Number}       Current editor post ID
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
 * @param  {Object}  state Global state tree
 * @param  {Number} siteId      Site ID
 * @param  {Number} postId      Post ID
 * @param  {String} type        Post type
 */
export function getEditorDuplicatePostPath( state, siteId, postId, type = 'post' ) {
	const editorNewPostPath = getEditorNewPostPath( state, siteId, type );
	return `${ editorNewPostPath }?copy=${ postId }`;
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
		case 'post': path = '/post'; break;
		case 'page': path = '/page'; break;
		default: path = `/edit/${ type }`; break;
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
	const type = get( getEditedPost( state, siteId, postId ), 'type', defaultType );
	let path = getEditorNewPostPath( state, siteId, type );

	if ( postId ) {
		path += `/${ postId }`;
	}

	return path;
}

/**
 * Returns whether the confirmation sidebar is enabled for the given siteId
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId      Site ID
 * @return {Boolean}             Whether or not the sidebar is enabled
 */
export function isConfirmationSidebarEnabled( state, siteId ) {
	return getPreference( state, 'editorConfirmationDisabledSites' ).indexOf( siteId ) === -1;
}
