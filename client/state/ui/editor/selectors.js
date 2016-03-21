/**
 * External dependencies
 */
import get from 'lodash/get';
import includes from 'lodash/includes';

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
 * Returns the editor URL path for the given site ID, post ID pair.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} postId Post ID
 * @return {String}        Editor URL path
 */
export function getEditorPath( state, siteId, postId ) {
	const type = get( getEditedPost( state, siteId, postId ), 'type', 'post' );

	let path;
	switch ( type ) {
		case 'post': path = '/post'; break;
		case 'page': path = '/page'; break;
		default: path = `/edit`; break;
	}

	const siteSlug = getSiteSlug( state, siteId );
	if ( siteSlug ) {
		path += `/${ siteSlug }`;
	} else {
		path += `/${ siteId }`;
	}

	if ( ! includes( [ 'post', 'page' ], type ) ) {
		path += `/${ type }`;
	}

	if ( postId ) {
		path += `/${ postId }`;
	}

	return path;
}
