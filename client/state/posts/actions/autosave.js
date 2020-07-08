/**
 * External dependencies
 */
import store from 'store';

/**
 * Internal dependencies
 */
import { saveEdited } from 'state/posts/actions/save-edited';
import { getSitePost, getEditedPost, isEditedPostDirty } from 'state/posts/selectors';
import { isPublished } from 'state/posts/utils';
import { editorAutosave } from 'state/editor/actions';
import { getEditorPostId } from 'state/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

import 'state/posts/init';

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
