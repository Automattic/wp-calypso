/* eslint-disable jsdoc/no-undefined-types */
/**
 * External dependencies
 */

import { defaults, filter, get } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	EDITOR_AUTOSAVE,
	EDITOR_AUTOSAVE_RESET,
	EDITOR_AUTOSAVE_SUCCESS,
	EDITOR_AUTOSAVE_FAILURE,
	EDITOR_IFRAME_LOADED,
	EDITOR_LOADING_ERROR_RESET,
	EDITOR_PASTE_EVENT,
	EDITOR_RESET,
	EDITOR_START,
	EDITOR_STOP,
	EDITOR_SAVE,
	EDITOR_EDIT_RAW_CONTENT,
	EDITOR_RESET_RAW_CONTENT,
	EDITOR_INIT_RAW_CONTENT,
} from 'state/action-types';
import { ModalViews } from 'state/ui/media-modal/constants';
import { setMediaModalView } from 'state/ui/media-modal/actions';
import { withAnalytics, bumpStat, recordTracksEvent } from 'state/analytics/actions';
import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';
import { editPost } from 'state/posts/actions';

/**
 * Constants
 */
export const MODAL_VIEW_STATS = {
	[ ModalViews.LIST ]: 'view_list',
	[ ModalViews.DETAIL ]: 'view_detail',
	[ ModalViews.GALLERY ]: 'view_gallery',
	[ ModalViews.IMAGE_EDITOR ]: 'view_edit',
	[ ModalViews.VIDEO_EDITOR ]: 'view_edit',
};

/**
 * Returns an action object to be used in signalling that the editor should
 * begin to edit the post with the specified post ID, or `null` as a new post.
 *
 * @param  {number}  siteId   Site ID
 * @param  {?number} postId   Post ID
 * @returns {Action}           Action object
 */
export function startEditingPost( siteId, postId ) {
	return ( dispatch ) => {
		dispatch( editorReset( { isLoading: true } ) );
		dispatch( { type: EDITOR_START, siteId, postId } );
	};
}

export function startEditingNewPost( siteId, post ) {
	return ( dispatch ) => {
		const postAttributes = defaults( post, {
			status: 'draft',
			type: 'post',
			content: '',
			title: '',
		} );

		dispatch( editorReset( { isLoading: true } ) );
		dispatch( { type: EDITOR_START, siteId, postId: null } );
		dispatch( editPost( siteId, null, postAttributes ) );
		dispatch( editorReset() );
	};
}

/**
 * Returns an action object to be used in signalling that the editor should
 * stop editing.
 *
 * @param  {number}  siteId Site ID
 * @param  {?number} postId Post ID
 * @returns {Action}         Action object
 */
export function stopEditingPost( siteId, postId ) {
	return ( dispatch ) => {
		dispatch( editorReset() );
		dispatch( { type: EDITOR_STOP, siteId, postId } );
	};
}

/**
 * Returns an action object to be used in signalling that the user has pasted
 * some content from source.
 *
 * @param {string} source Identifier of the app the content was pasted from.
 * @returns {object} Action object
 */
export function pasteEvent( source ) {
	return {
		type: EDITOR_PASTE_EVENT,
		source,
	};
}

/**
 * Returns an action object used in signalling that the media modal current
 * view should be updated in the context of the post editor.
 *
 * @param  {ModalViews} view Media view
 * @returns {object}          Action object
 */
export function setEditorMediaModalView( view ) {
	const action = setMediaModalView( view );

	const stat = MODAL_VIEW_STATS[ view ];
	if ( stat ) {
		return withAnalytics( bumpStat( 'editor_media_actions', stat ), action );
	}

	return action;
}

/**
 * Returns an action object used in signalling that the confirmation sidebar
 * preference has changed.
 *
 * @param  {number}  siteId    Site ID
 * @param  {?Bool}   isEnabled Whether or not the sidebar should be shown
 * @returns {object}            Action object
 */
export function saveConfirmationSidebarPreference( siteId, isEnabled = true ) {
	return ( dispatch, getState ) => {
		const disabledSites = getPreference( getState(), 'editorConfirmationDisabledSites' );

		if ( isEnabled ) {
			dispatch(
				savePreference(
					'editorConfirmationDisabledSites',
					filter( disabledSites, ( _siteId ) => siteId !== _siteId )
				)
			);
		} else {
			dispatch( savePreference( 'editorConfirmationDisabledSites', [ ...disabledSites, siteId ] ) );
		}

		dispatch(
			recordTracksEvent(
				isEnabled
					? 'calypso_publish_confirmation_preference_enable'
					: 'calypso_publish_confirmation_preference_disable'
			)
		);

		dispatch( bumpStat( 'calypso_publish_confirmation', isEnabled ? 'enabled' : 'disabled' ) );
	};
}

export const setEditorIframeLoaded = ( isIframeLoaded = true ) => ( {
	type: EDITOR_IFRAME_LOADED,
	isIframeLoaded,
} );

export const editorAutosaveReset = () => ( {
	type: EDITOR_AUTOSAVE_RESET,
} );

export const editorAutosaveSuccess = ( autosave ) => ( {
	type: EDITOR_AUTOSAVE_SUCCESS,
	autosave,
} );

export const editorAutosaveFailure = ( error ) => ( {
	type: EDITOR_AUTOSAVE_FAILURE,
	error,
} );

export const editorAutosave = ( post ) => ( dispatch ) => {
	if ( ! post.ID ) {
		return Promise.reject( new Error( 'NO_AUTOSAVE' ) );
	}

	dispatch( { type: EDITOR_AUTOSAVE } );

	const autosaveResult = wpcom.undocumented().site( post.site_ID ).postAutosave( post.ID, {
		content: post.content,
		title: post.title,
		excerpt: post.excerpt,
	} );

	autosaveResult
		.then( ( autosave ) => dispatch( editorAutosaveSuccess( autosave ) ) )
		.catch( ( error ) => dispatch( editorAutosaveFailure( error ) ) );

	return autosaveResult;
};

/**
 * Edits the raw TinyMCE content of a post
 *
 * @param {string} content Raw content
 * @returns {Action} Action object
 */
export function editorEditRawContent( content ) {
	return {
		type: EDITOR_EDIT_RAW_CONTENT,
		content,
	};
}

/**
 * Unsets the raw TinyMCE content value
 *
 * @returns {Action} Action object
 */
export function editorResetRawContent() {
	return {
		type: EDITOR_RESET_RAW_CONTENT,
	};
}

export function editorInitRawContent( content ) {
	return {
		type: EDITOR_INIT_RAW_CONTENT,
		content,
	};
}

export function editorReset( options ) {
	return {
		type: EDITOR_RESET,
		isLoading: get( options, 'isLoading', false ),
		loadingError: get( options, 'loadingError', null ),
	};
}

export function editorSetLoadingError( loadingError ) {
	return editorReset( { loadingError } );
}

export function editorLoadingErrorReset() {
	return {
		type: EDITOR_LOADING_ERROR_RESET,
	};
}

export const editorSave = ( siteId, postId, saveMarker ) => ( {
	type: EDITOR_SAVE,
	siteId,
	postId,
	saveMarker,
} );
