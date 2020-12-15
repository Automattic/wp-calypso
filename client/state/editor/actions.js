/**
 * External dependencies
 */
import { defaults, filter, get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	EDITOR_IFRAME_LOADED,
	EDITOR_LOADING_ERROR_RESET,
	EDITOR_PASTE_EVENT,
	EDITOR_RESET,
	EDITOR_START,
	EDITOR_STOP,
	EDITOR_SAVE,
	EDITOR_EDIT_RAW_CONTENT,
	EDITOR_RESET_RAW_CONTENT,
} from 'calypso/state/action-types';
import { ModalViews } from 'calypso/state/ui/media-modal/constants';
import { setMediaModalView } from 'calypso/state/ui/media-modal/actions';
import { withAnalytics, bumpStat, recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { editPost } from 'calypso/state/posts/actions';

import 'calypso/state/editor/init';
import 'calypso/state/ui/init';

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
 * @returns {any}           Action object
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
 * @returns {any}         Action object
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
 * @param  {?boolean}   isEnabled Whether or not the sidebar should be shown
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

export const setEditorIframeLoaded = ( isIframeLoaded = true, iframePort = null ) => ( {
	type: EDITOR_IFRAME_LOADED,
	isIframeLoaded,
	iframePort,
} );

/**
 * Edits the raw TinyMCE content of a post
 *
 * @param {string} content Raw content
 * @returns {any} Action object
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
 * @returns {any} Action object
 */
export function editorResetRawContent() {
	return {
		type: EDITOR_RESET_RAW_CONTENT,
	};
}

export function editorReset( options ) {
	return {
		type: EDITOR_RESET,
		isLoading: get( options, 'isLoading', false ),
		loadingError: get( options, 'loadingError', null ),
	};
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
