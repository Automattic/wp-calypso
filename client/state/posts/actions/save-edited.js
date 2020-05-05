/**
 * External dependencies
 */
import { assign, clone, get, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { receivePost } from 'state/posts/actions/receive-post';
import { savePostSuccess } from 'state/posts/actions/save-post-success';
import { getEditedPost, getPostEdits } from 'state/posts/selectors';
import { recordSaveEvent } from 'state/posts/stats';
import {
	isBackDated,
	isFutureDated,
	normalizePostForActions,
	normalizeTermsForApi,
} from 'state/posts/utils';
import editedPostHasContent from 'state/selectors/edited-post-has-content';
import {
	editorAutosaveReset,
	editorInitRawContent,
	editorLoadingErrorReset,
	editorSave,
} from 'state/ui/editor/actions';
import {
	getEditorInitialRawContent,
	getEditorPostId,
	getEditorRawContent,
	isEditorSaveBlocked,
} from 'state/ui/editor/selectors';
import { resetEditorLastDraft, setEditorLastDraft } from 'state/ui/editor/last-draft/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPreference } from 'state/preferences/selectors';

import 'state/posts/init';

let saveMarkerId = 0;

/**
 * Normalizes attributes to API expectations
 *
 * @param  {object} attributes - changed attributes
 * @returns {object} - normalized attributes
 */
function normalizeApiAttributes( attributes ) {
	attributes = clone( attributes );
	attributes = normalizeTermsForApi( attributes );

	if ( attributes.author ) {
		attributes.author = attributes.author.ID;
	}

	return attributes;
}

/*
 * Calls out to API to save a Post object
 *
 * @param {object} options object with optional recordSaveEvent property. True if you want to record the save event.
 */
export const saveEdited = ( options ) => async ( dispatch, getState ) => {
	const siteId = getSelectedSiteId( getState() );
	const postId = getEditorPostId( getState() );
	const post = getEditedPost( getState(), siteId, postId );

	// Don't send a request to the API if the post has no content (title,
	// content, or excerpt). A post without content is invalid.
	if ( ! editedPostHasContent( getState(), siteId, postId ) ) {
		throw new Error( 'NO_CONTENT' );
	}

	// Prevent saving post if another module has blocked saving.
	if ( isEditorSaveBlocked( getState() ) ) {
		throw new Error( 'SAVE_BLOCKED' );
	}

	const initialRawContent = getEditorInitialRawContent( getState() );
	const rawContent = getEditorRawContent( getState() );

	let changedAttributes = getPostEdits( getState(), siteId, postId );

	// when toggling editor modes, it is possible for the post to be dirty
	// even though the content hasn't changed. To avoid a confusing UX
	// let's just pass the content through and save it anyway
	if ( ! get( changedAttributes, 'content' ) && rawContent !== initialRawContent ) {
		changedAttributes = {
			...changedAttributes,
			content: post.content,
		};
	}

	// Don't send a request to the API if the post is unchanged. An empty post request is invalid.
	// This case is not treated as error, but rather as a successful save.
	if ( isEmpty( changedAttributes ) ) {
		return null;
	}

	const saveMarker = `save-marker-${ ++saveMarkerId }`;
	dispatch( editorSave( siteId, postId, saveMarker ) );

	changedAttributes = normalizeApiAttributes( changedAttributes );
	const mode = getPreference( getState(), 'editor-mode' );
	const isNew = ! postId;

	const postHandle = wpcom.site( siteId ).post( postId );
	const query = {
		context: 'edit',
		apiVersion: '1.2',
	};
	if ( options && options.autosave ) {
		query.autosave = options.autosave;
	}

	if ( ! options || options.recordSaveEvent !== false ) {
		dispatch( recordSaveEvent() ); // do this before changing status from 'future'
	}

	if (
		( changedAttributes && changedAttributes.status === 'future' && isFutureDated( post ) ) ||
		( changedAttributes && changedAttributes.status === 'publish' && isBackDated( post ) )
	) {
		// HACK: This is necessary because for some reason v1.1 and v1.2 of the update post endpoints
		// don't accept a status of 'future' under any conditions.
		// We also need to make sure that we send the date so that the post isn't published.

		// HACK^2: If a post is back-dated, we must also pass in the date, otherwise the API resets the date
		// here /public.api/rest/json-endpoints/class.wpcom-json-api-update-post-v1-2-endpoint.php#L102
		changedAttributes = assign( {}, changedAttributes, {
			status: 'publish',
			date: post.date,
		} );
	}

	const data = await postHandle[ isNew ? 'add' : 'update' ]( query, changedAttributes );

	const currentMode = getPreference( getState(), 'editor-mode' );

	dispatch( editorAutosaveReset() );
	dispatch( editorLoadingErrorReset() );

	// Retrieve the normalized post and use it to update Redux store
	const receivedPost = normalizePostForActions( data );

	if ( receivedPost.status === 'draft' ) {
		// If a draft was successfully saved, set it as "last edited draft"
		// There's UI in masterbar for one-click "continue editing"
		dispatch( setEditorLastDraft( receivedPost.site_ID, receivedPost.ID ) );
	} else {
		// Draft was published or trashed: reset the "last edited draft" record
		dispatch( resetEditorLastDraft() );
	}

	// `post.ID` can be null/undefined, which means we're saving new post.
	// `savePostSuccess` will convert the temporary ID (empty string key) in Redux
	// to the newly assigned ID in `receivedPost.ID`.
	dispatch( savePostSuccess( receivedPost.site_ID, post.ID, receivedPost, {} ) );
	dispatch( receivePost( receivedPost, saveMarker ) );

	// Only re-init the rawContent if the mode hasn't changed since the request was initiated.
	// Changing the mode re-initializes the rawContent, so we don't want to stomp on it
	if ( mode === currentMode ) {
		dispatch( editorInitRawContent( rawContent ) );
	}

	/*
	 * Return a "save result" object that contains the received post object and a boolean
	 * flag that tells whether a post ID was assigned during this save. Happens when a new draft
	 * has been just saved for the first time.
	 */
	return {
		receivedPost,
		idAssigned: post.ID !== receivedPost.ID,
	};
};
