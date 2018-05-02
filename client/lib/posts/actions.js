/** @format */

/**
 * External dependencies
 */

import store from 'store';
import { assign, clone, defer, fromPairs, map } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import PostEditStore from './post-edit-store';
import PreferencesStore from 'lib/preferences/store';
import * as utils from './utils';
import versionCompare from 'lib/version-compare';
import Dispatcher from 'dispatcher';
import { recordSaveEvent } from './stats';
import { normalizeTermsForApi } from 'state/posts/utils';
import { reduxGetState } from 'lib/redux-bridge';
import { isEditorSaveBlocked } from 'state/ui/editor/selectors';

let PostActions;

/**
 * Helper for performing a metadata operation on the currently edited post.
 * Accepts a key, value, and operation, where key may be a string or array
 * of string keys. Alternatively, specify an object of key value pairs as the
 * first parameter. Dispatches an `EDIT_POST` action.
 *
 * @param  {(String|String[]|Object)} key       The metadata key(s) or object
 *                                              of metadata key-value pairs
 * @param  {*}                        value     The metadata value
 * @param  {String}                   operation The metadata operation to
 *                                              perform (`add`, `update`,
 *                                              or `delete`)
 */
function handleMetadataOperation( key, value, operation ) {
	// Normalize a string or array of string keys to an object of key value pairs.
	if ( 'string' === typeof key ) {
		// case of handleMetadataOperation( 'excerpt', 'text', 'update' )
		key = { [ key ]: value };
	} else if ( Array.isArray( key ) ) {
		// case of handleMetadataOperation( [ 'geo_latitude', 'geo_longitude' ], null, 'delete' )
		key = fromPairs( key.map( meta => [ meta, value ] ) );
	}

	const metadata = map( key, function( objectValue, objectKey ) {
		// `update` is a sufficient operation for new metadata, as it will add
		// the metadata if it does not already exist. Similarly, we're not
		// concerned with deleting a key which was added during previous edits,
		// since this will effectively noop.
		const meta = {
			key: objectKey,
			operation,
		};

		if ( 'delete' !== operation ) {
			meta.value = objectValue;
		}

		return meta;
	} );

	Dispatcher.handleViewAction( {
		type: 'EDIT_POST',
		post: {
			metadata,
		},
	} );
}

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
	 */
	startEditingExisting: function( site, postId ) {
		let currentPost = PostEditStore.get(),
			postHandle;

		if ( ! site || ! site.ID ) {
			return;
		}

		if ( currentPost && currentPost.site_ID === site.ID && currentPost.ID === postId ) {
			return; // already editing same post
		}

		Dispatcher.handleViewAction( {
			type: 'START_EDITING_POST',
			siteId: site.ID,
			postId: postId,
		} );

		postHandle = wpcom.site( site.ID ).post( postId );

		postHandle.get( { context: 'edit', meta: 'autosave' }, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_POST_TO_EDIT',
				error: error,
				post: data,
				site,
			} );
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

	autosave: function( site, callback ) {
		let post = PostEditStore.get(),
			savedPost = PostEditStore.getSavedPost(),
			siteHandle = wpcom.undocumented().site( post.site_ID );

		callback = callback || function() {};

		if ( ! PostEditStore.isDirty() ) {
			return callback( new Error( 'NOT_DIRTY' ) );
		}

		store.set( 'wpcom-autosave:' + post.site_ID + ':' + post.ID, post );

		// TODO: incorporate post locking
		if ( utils.isPublished( savedPost ) || utils.isPublished( post ) ) {
			if (
				! post.ID ||
				! site ||
				( site.jetpack && versionCompare( site.options.jetpack_version, '3.7.0-dev', '<' ) )
			) {
				return callback( new Error( 'NO_AUTOSAVE' ) );
			}

			Dispatcher.handleViewAction( {
				type: 'POST_AUTOSAVE',
				post: post,
			} );

			siteHandle.postAutosave(
				post.ID,
				{
					content: post.content,
					title: post.title,
					excerpt: post.excerpt,
				},
				function( error, data ) {
					Dispatcher.handleServerAction( {
						type: 'RECEIVE_POST_AUTOSAVE',
						error: error,
						autosave: data,
						site,
					} );

					callback( error, data );
				}
			);
		} else {
			PostActions.saveEdited( site, null, null, callback, {
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
	 * Edits metadata attributes on a post
	 *
	 * @param {(string|object)} key The metadata key, or an object of key-value pairs
	 * @param {*} value The metadata value
	 */
	updateMetadata: function( key, value ) {
		handleMetadataOperation( key, value, 'update' );
	},

	/**
	 * Deletes a metadata attribute from a post
	 *
	 * @param {string} key The metadata key
	 */
	deleteMetadata: function( key ) {
		handleMetadataOperation( key, null, 'delete' );
	},

	/**
	 * Calls out to API to save a Post object
	 *
	 * @param {Object} site Site object
	 * @param {object} attributes post attributes to change before saving
	 * @param {object} context additional properties for recording the save event
	 * @param {function} callback receives ( err, post ) arguments
	 * @param {object} options object with optional recordSaveEvent property. True if you want to record the save event.
	 */
	saveEdited: function( site, attributes, context, callback, options ) {
		let post, postHandle, query, changedAttributes, rawContent, mode, isNew;

		// TODO: skip this edit if `attributes` are `null`. That means
		// we don't want to do any additional edit before saving.
		Dispatcher.handleViewAction( {
			type: 'EDIT_POST',
			post: attributes,
		} );

		post = PostEditStore.get();

		// Don't send a request to the API if the post has no content (title,
		// content, or excerpt). A post without content is invalid.
		if ( ! PostEditStore.hasContent() ) {
			defer( callback, new Error( 'NO_CONTENT' ), post );
			return;
		}

		// Prevent saving post if another module has blocked saving.
		if ( isEditorSaveBlocked( reduxGetState() ) ) {
			defer( callback, new Error( 'SAVE_BLOCKED' ), post );
			return;
		}

		changedAttributes = PostEditStore.getChangedAttributes();

		// Don't send a request to the API if the post is unchanged. An empty
		// post request is invalid.
		if ( ! Object.keys( changedAttributes ).length ) {
			defer( callback, new Error( 'NO_CHANGE' ), post );
			return;
		}

		changedAttributes = normalizeApiAttributes( changedAttributes );
		rawContent = PostEditStore.getRawContent();
		mode = PreferencesStore.get( 'editor-mode' );
		isNew = ! post.ID;

		// There is a separate action dispatched here because we need to queue changes
		// that occur while the subsequent AJAX request is in-flight
		Dispatcher.handleViewAction( {
			type: 'EDIT_POST_SAVE',
		} );

		postHandle = wpcom.site( post.site_ID ).post( post.ID );
		query = {
			context: 'edit',
			apiVersion: '1.2',
		};
		if ( options && options.autosave ) {
			query.autosave = options.autosave;
		}

		if ( ! options || options.recordSaveEvent !== false ) {
			recordSaveEvent( site, context ); // do this before changing status from 'future'
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

		postHandle[ isNew ? 'add' : 'update' ]( query, changedAttributes, function( error, data ) {
			const currentMode = PreferencesStore.get( 'editor-mode' );

			Dispatcher.handleServerAction( {
				type: 'RECEIVE_POST_BEING_EDITED',
				error: error,
				// Only pass the rawContent if the mode hasn't changed since the request
				// was initiated. Changing the mode re-initializes the rawContent, so we don't want to stomp on
				// it
				rawContent: mode === currentMode ? rawContent : null,
				isNew: isNew,
				post: data,
				site,
			} );

			callback( error, data );
		} );
	},
};

export default PostActions;
