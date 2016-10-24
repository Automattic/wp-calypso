/**
 * External dependencies
 */
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import { getSiteSlug } from 'state/sites/selectors';
import { getEditedPost } from 'state/posts/selectors';

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
 * Returns whether the editor drafts drawer is visible.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether drafts are visible
 */
export function isEditorDraftsVisible( state ) {
	return state.ui.editor.showDrafts;
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
