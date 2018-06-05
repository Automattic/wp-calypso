/** @format */

/**
 * External dependencies
 */

import store from 'store';
import { assign, clone } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import PostEditStore from './post-edit-store';
import PreferencesStore from 'lib/preferences/store';
import * as utils from './utils';
import Dispatcher from 'dispatcher';
import { recordSaveEvent } from './stats';
import { normalizeTermsForApi } from 'state/posts/utils';
import { reduxDispatch, reduxGetState } from 'lib/redux-bridge';
import { isEditorSaveBlocked } from 'state/ui/editor/selectors';
import { editorAutosave } from 'state/ui/editor/actions';
import { setEditorLastDraft, resetEditorLastDraft } from 'state/ui/editor/last-draft/actions';
import { receivePost, savePostSuccess } from 'state/posts/actions';

let PostActions;

/**
 * Normalizes attributes to API expectations
 * @param  {object} attributes - changed attributes
 * @return {object} - normalized attributes
 */
function normalizeApiAttributes( attributes ) {
	attributes = clone( attributes );
	attributes = normalizeTermsForApi( attributes );

	if ( attributes.author ) {
		attributes.author = attributes.author.ID;
	}

	return attributes;
}

PostActions = {
	/**
	 * Start keeping track of edits to a new post
	 *
	 * @param {Object} site    Site object
	 * @param {Object} options Edit options
	 */
	startEditingNew: function( site, options ) {
		let args;
		options = options || {};

		args = {
			type: 'DRAFT_NEW_POST',
			postType: options.type || 'post',
			title: options.title,
			content: options.content,
			site,
		};

		Dispatcher.handleViewAction( args );
	},

	/**
	 * Load an existing post and keep track of edits to it
	 *
	 * @param {Object} site   Site object
	 * @param {Number} postId Post ID to load
	 * @return {Promise<?Object>} The edited post object
	 */
	startEditingExisting: function( site, postId ) {
		if ( ! site || ! site.ID ) {
			return Promise.resolve( null );
		}

		const currentPost = PostEditStore.get();
		if ( currentPost && currentPost.site_ID === site.ID && currentPost.ID === postId ) {
			return Promise.resolve( currentPost ); // already editing same post
		}

		Dispatcher.handleViewAction( {
			type: 'START_EDITING_POST',
			siteId: site.ID,
			postId: postId,
		} );

		return wpcom
			.site( site.ID )
			.post( postId )
			.get( { context: 'edit', meta: 'autosave' } )
			.then( post => {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_POST_TO_EDIT',
					post,
					site,
				} );

				// Retrieve the normalized post and use it to update Redux store
				const receivedPost = PostEditStore.get();
				reduxDispatch( receivePost( receivedPost ) );

				return receivedPost;
			} )
			.catch( error => {
				Dispatcher.handleServerAction( {
					type: 'SET_POST_LOADING_ERROR',
					error,
				} );

				return null;
			} );
	},

	/**
	 * Stop keeping track of edits to a post
	 */
	stopEditing: function() {
		Dispatcher.handleViewAction( {
			type: 'STOP_EDITING_POST',
		} );
	},

	autosave: async function() {
		const post = PostEditStore.get();
		const savedPost = PostEditStore.getSavedPost();

		if ( ! PostEditStore.isDirty() ) {
			throw new Error( 'NOT_DIRTY' );
		}

		store.set( 'wpcom-autosave:' + post.site_ID + ':' + post.ID, post );

		// TODO: incorporate post locking
		if ( utils.isPublished( savedPost ) || utils.isPublished( post ) ) {
			await reduxDispatch( editorAutosave( post ) );
		} else {
			await PostActions.saveEdited( null, {
				recordSaveEvent: false,
				autosave: true,
			} );
		}
	},

	/**
	 * Edits attributes on a post
	 *
	 * @param {object} attributes to change
	 */
	edit: function( attributes ) {
		Dispatcher.handleViewAction( {
			type: 'EDIT_POST',
			post: attributes,
		} );
	},

	/**
	 * Edits the raw TinyMCE content of a post
	 *
	 * @param {string} content Raw content
	 */
	editRawContent: function( content ) {
		Dispatcher.handleViewAction( {
			type: 'EDIT_POST_RAW_CONTENT',
			content: content,
		} );
	},

	/**
	 * Unsets the raw TinyMCE content value
	 */
	resetRawContent: function() {
		Dispatcher.handleViewAction( {
			type: 'RESET_POST_RAW_CONTENT',
		} );
	},

	/**
	 * Calls out to API to save a Post object
	 *
	 * @param {object} attributes post attributes to change before saving
	 * @param {object} options object with optional recordSaveEvent property. True if you want to record the save event.
	 */
	saveEdited: async function( attributes, options ) {
		// TODO: skip this edit if `attributes` are `null`. That means
		// we don't want to do any additional edit before saving.
		Dispatcher.handleViewAction( {
			type: 'EDIT_POST',
			post: attributes,
		} );

		const post = PostEditStore.get();

		// Don't send a request to the API if the post has no content (title,
		// content, or excerpt). A post without content is invalid.
		if ( ! PostEditStore.hasContent() ) {
			throw new Error( 'NO_CONTENT' );
		}

		// Prevent saving post if another module has blocked saving.
		if ( isEditorSaveBlocked( reduxGetState() ) ) {
			throw new Error( 'SAVE_BLOCKED' );
		}

		let changedAttributes = PostEditStore.getChangedAttributes();

		// Don't send a request to the API if the post is unchanged. An empty  post request is invalid.
		// This case is not treated as error, but rather as a successful save.
		if ( ! Object.keys( changedAttributes ).length ) {
			return;
		}

		changedAttributes = normalizeApiAttributes( changedAttributes );
		const rawContent = PostEditStore.getRawContent();
		const mode = PreferencesStore.get( 'editor-mode' );
		const isNew = ! post.ID;

		// There is a separate action dispatched here because we need to queue changes
		// that occur while the subsequent AJAX request is in-flight
		Dispatcher.handleViewAction( {
			type: 'EDIT_POST_SAVE',
		} );

		const postHandle = wpcom.site( post.site_ID ).post( post.ID );
		const query = {
			context: 'edit',
			apiVersion: '1.2',
		};
		if ( options && options.autosave ) {
			query.autosave = options.autosave;
		}

		if ( ! options || options.recordSaveEvent !== false ) {
			reduxDispatch( recordSaveEvent() ); // do this before changing status from 'future'
		}

		if (
			( changedAttributes &&
				changedAttributes.status === 'future' &&
				utils.isFutureDated( post ) ) ||
			( changedAttributes && changedAttributes.status === 'publish' && utils.isBackDated( post ) )
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

		try {
			const data = await postHandle[ isNew ? 'add' : 'update' ]( query, changedAttributes );

			const currentMode = PreferencesStore.get( 'editor-mode' );

			Dispatcher.handleServerAction( {
				type: 'RECEIVE_POST_BEING_EDITED',
				// Only pass the rawContent if the mode hasn't changed since the request
				// was initiated. Changing the mode re-initializes the rawContent, so we don't want to stomp on
				// it
				rawContent: mode === currentMode ? rawContent : null,
				post: data,
			} );

			// Retrieve the normalized post and use it to update Redux store
			const receivedPost = PostEditStore.get();

			if ( receivedPost.status === 'draft' ) {
				// If a draft was successfully saved, set it as "last edited draft"
				// There's UI in masterbar for one-click "continue editing"
				reduxDispatch( setEditorLastDraft( receivedPost.site_ID, receivedPost.ID ) );
			} else {
				// Draft was published or trashed: reset the "last edited draft" record
				reduxDispatch( resetEditorLastDraft() );
			}

			// `post.ID` can be null/undefined, which means we're saving new post.
			// `savePostSuccess` will convert the temporary ID (empty string key) in Redux
			// to the newly assigned ID in `receivedPost.ID`.
			reduxDispatch( savePostSuccess( receivedPost.site_ID, post.ID, receivedPost, {} ) );
			reduxDispatch( receivePost( receivedPost ) );
		} catch ( error ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_POST_BEING_EDITED',
				error,
			} );

			throw error;
		}
	},
};

export default PostActions;
