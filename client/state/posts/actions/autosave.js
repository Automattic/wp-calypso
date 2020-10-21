/**
 * External dependencies
 */
import store from 'store';

/**
 * Internal dependencies
 */
import { saveEdited } from 'calypso/state/posts/actions/save-edited';
import { getSitePost, getEditedPost, isEditedPostDirty } from 'calypso/state/posts/selectors';
import { isPublished } from 'calypso/state/posts/utils';
import { editorAutosave } from 'calypso/state/editor/actions';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import 'calypso/state/posts/init';

export const autosave = () => async ( dispatch, getState ) => {
	const state = getState();

	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );

	if ( ! isEditedPostDirty( state, siteId, postId ) ) {
		return null;
	}

	const savedPost = getSitePost( state, siteId, postId );
	const post = getEditedPost( state, siteId, postId );

	store.set( 'wpcom-autosave:' + siteId + ':' + postId, post );

	// TODO: incorporate post locking
	if ( isPublished( savedPost ) || isPublished( post ) ) {
		await dispatch( editorAutosave( post ) );
		return null;
	}

	return await dispatch( saveEdited( { recordSaveEvent: false, autosave: true } ) );
};
