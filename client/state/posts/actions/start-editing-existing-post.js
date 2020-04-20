/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { receivePost } from 'state/posts/actions/receive-post';
import { getEditedPost } from 'state/posts/selectors';
import { normalizePostForActions } from 'state/posts/utils';
import isPreviousRouteGutenberg from 'state/selectors/is-previous-route-gutenberg';
import { editorReset, editorSetLoadingError, startEditingPost } from 'state/ui/editor/actions';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

import 'state/posts/init';

/**
 * Load an existing post and keep track of edits to it
 *
 * @param {object} siteId Site ID
 * @param {number} postId Post ID to load
 * @returns {Promise<?object>} The edited post object
 */
export const startEditingExistingPost = ( siteId, postId ) => ( dispatch, getState ) => {
	const currentSiteId = getSelectedSiteId( getState() );
	const currentPostId = getEditorPostId( getState() );
	const hasJustOptedOutOfGutenberg = isPreviousRouteGutenberg( getState() );
	if ( ! hasJustOptedOutOfGutenberg && currentSiteId === siteId && currentPostId === postId ) {
		// already editing same post
		return Promise.resolve( getEditedPost( getState(), siteId, postId ) );
	}

	dispatch( startEditingPost( siteId, postId ) );

	return wpcom
		.site( siteId )
		.post( postId )
		.get( { context: 'edit', meta: 'autosave' } )
		.then( ( post ) => {
			post = normalizePostForActions( post );
			dispatch( receivePost( post ) );
			dispatch( editorReset() );
			return post;
		} )
		.catch( ( error ) => {
			dispatch( editorSetLoadingError( error ) );
			return null;
		} );
};
