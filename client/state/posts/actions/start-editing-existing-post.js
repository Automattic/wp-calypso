/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { receivePost } from 'calypso/state/posts/actions/receive-post';
import { getEditedPost } from 'calypso/state/posts/selectors';
import { normalizePostForActions } from 'calypso/state/posts/utils';
import isPreviousRouteGutenberg from 'calypso/state/selectors/is-previous-route-gutenberg';
import { editorReset, editorSetLoadingError, startEditingPost } from 'calypso/state/editor/actions';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import 'calypso/state/posts/init';

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
