/**
 * External dependencies
 */
import store from 'store';

/**
 * Internal dependencies
 */
import { getSitePost, getEditedPost, isEditedPostDirty } from 'state/posts/selectors';
import { isPublished } from 'state/posts/utils';
import { editorAutosave } from 'state/ui/editor/actions';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

import 'state/posts/init';

import { saveEdited } from 'state/posts/actions/save-edited';

export { receivePosts } from 'state/posts/actions/receive-posts';
export { receivePost } from 'state/posts/actions/receive-post';
export { requestSitePosts } from 'state/posts/actions/request-site-posts';
export { requestAllSitesPosts } from 'state/posts/actions/request-all-sites-posts';
export { requestSitePost } from 'state/posts/actions/request-site-post';
export { editPost } from 'state/posts/actions/edit-post';
export { updatePostMetadata } from 'state/posts/actions/update-post-metadata';
export { deletePostMetadata } from 'state/posts/actions/delete-post-metadata';
export { savePostSuccess } from 'state/posts/actions/save-post-success';
export { savePost } from 'state/posts/actions/save-post';
export { trashPost } from 'state/posts/actions/trash-post';
export { deletePost } from 'state/posts/actions/delete-post';
export { restorePost } from 'state/posts/actions/restore-post';
export { addTermForPost } from 'state/posts/actions/add-term-for-post';
export { startEditingExistingPost } from 'state/posts/actions/start-editing-existing-post';
export { startEditingPostCopy } from 'state/posts/actions/start-editing-post-copy';
export { saveEdited } from 'state/posts/actions/save-edited';

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
