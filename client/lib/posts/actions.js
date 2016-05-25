/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:posts' ),
	defer = require( 'lodash/defer' ),
	store = require( 'store' ),
	clone = require( 'lodash/clone' ),
	fromPairs = require( 'lodash/fromPairs' ),
	assign = require( 'lodash/assign' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	PostsStore = require( './posts-store' ),
	PostEditStore = require( './post-edit-store' ),
	postListStoreFactory = require( './post-list-store-factory' ),
	PreferencesStore = require( 'lib/preferences/store' ),
	sites = require( 'lib/sites-list' )(),
	utils = require( './utils' ),
	versionCompare = require( 'lib/version-compare' ),
	Dispatcher = require( 'dispatcher' ),
	stats = require( './stats' );

var PostActions;

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
	var post = PostEditStore.get(),
		metadata;

	if ( 'string' === typeof key || Array.isArray( key ) ) {
		// Normalize a string or array of string keys to an object of key value
		// pairs. To accomodate both, we coerce the key into an array before
		// mapping to pull the object pairs.
		key = fromPairs( [].concat( key ).map( ( meta ) => [ meta, value ] ) );
	}

	// Overwrite duplicates based on key
	metadata = ( post.metadata || [] ).filter( ( meta ) => ! key.hasOwnProperty( meta.key ) );

	Object.keys( key ).forEach( function( objectKey ) {
		// `update` is a sufficient operation for new metadata, as it will add
		// the metadata if it does not already exist. Similarly, we're not
		// concerned with deleting a key which was added during previous edits,
		// since this will effectively noop.
		var meta = {
			key: objectKey,
			operation: operation
		};

		if ( 'delete' !== operation ) {
			meta.value = key[ objectKey ];
		}

		metadata.push( meta );
	} );

	Dispatcher.handleViewAction( {
		type: 'EDIT_POST',
		post: {
			metadata: metadata
		}
	} );
}

/**
 * Normalizes attributes to API expectations
 * @param  {object} attributes - changed attributes
 * @return {object} - normalized attributes
 */
function normalizeApiAttributes( attributes ) {
	attributes = clone( attributes );

	if ( attributes.author ) {
		attributes.author = attributes.author.ID;
	}

	if ( attributes.categories ) {
		// Force category IDs to strings to work with ctype_digit in some versions of the API.
		// (ctype_digit returns false for integers between -128 and 255).
		attributes.categories_by_id = attributes.categories.map( category => category.toString() );
		delete attributes.category_ids;
		delete attributes.categories;
	}

	return attributes;
}

PostActions = {
	/**
	 * Start keeping track of edits to a new post
	 *
	 * @param {Number} siteId  Site ID
	 * @param {Object} options Edit options
	 */
	startEditingNew: function( siteId, options ) {
		var args;
		options = options || {};

		args = {
			type: 'DRAFT_NEW_POST',
			siteId: siteId,
			postType: options.type || 'post',
			title: options.title,
			content: options.content,
		};

		Dispatcher.handleViewAction( args );
	},

	/**
	 * Load an existing post and keep track of edits to it
	 *
	 * @param {Number} siteId Site ID to load post from
	 * @param {Number} postId Post ID to load
	 */
	startEditingExisting: function( siteId, postId ) {
		var currentPost = PostEditStore.get(),
			postHandle;

		if ( ! siteId ) {
			return;
		}

		if ( currentPost && currentPost.site_ID === siteId && currentPost.ID === postId ) {
			return; // already editing same post
		}

		Dispatcher.handleViewAction( {
			type: 'START_EDITING_POST',
			siteId: siteId,
			postId: postId
		} );

		postHandle = wpcom.site( siteId ).post( postId );

		postHandle.get( { context: 'edit', meta: 'autosave' }, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_POST_TO_EDIT',
				error: error,
				post: data
			} );
		} );
	},

	/**
	 * Stop keeping track of edits to a post
	 */
	stopEditing: function() {
		Dispatcher.handleViewAction( {
			type: 'STOP_EDITING_POST'
		} );
	},

	autosave: function( callback ) {
		var post = PostEditStore.get(),
			savedPost = PostEditStore.getSavedPost(),
			siteHandle = wpcom.undocumented().site( post.site_ID ),
			site;

		callback = callback || function() {};

		if ( ! PostEditStore.isDirty() ) {
			return callback( new Error( 'NOT_DIRTY' ) );
		}

		store.set( 'wpcom-autosave:' + post.site_ID + ':' + post.ID, post );

		// TODO: incorporate post locking
		if ( utils.isPublished( savedPost ) || utils.isPublished( post ) ) {
			site = sites.getSite( post.site_ID );

			if ( ! post.ID || ! site || site.jetpack && versionCompare( site.options.jetpack_version, '3.7.0-dev', '<' ) ) {
				return callback( new Error( 'NO_AUTOSAVE' ) );
			}

			Dispatcher.handleViewAction( {
				type: 'POST_AUTOSAVE',
				post: post
			} );

			siteHandle.postAutosave( post.ID, {
				content: post.content,
				title: post.title,
				excerpt: post.excerpt
			}, function( error, data ) {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_POST_AUTOSAVE',
					error: error,
					autosave: data
				} );

				callback( error, data );
			} );
		} else {
			PostActions.saveEdited( null, callback, { recordSaveEvent: false } );
		}
	},

	/**
	 * Prevents the post from being saved
	 *
	 * @param {String} key Unique identifier to sandbox block condition
	 */
	blockSave: function( key ) {
		Dispatcher.handleViewAction( {
			type: 'BLOCK_EDIT_POST_SAVE',
			key: key
		} );
	},

	/**
	 * Allows a post to be saved after having been blocked
	 *
	 * @param {String} key Unique identifier to sandbox block condition
	 */
	unblockSave: function( key ) {
		Dispatcher.handleViewAction( {
			type: 'UNBLOCK_EDIT_POST_SAVE',
			key: key
		} );
	},

	/**
	 * Edits attributes on a post
	 *
	 * @param {object} attributes to change
	 */
	edit: function( attributes ) {
		Dispatcher.handleViewAction( {
			type: 'EDIT_POST',
			post: attributes
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
			content: content
		} );
	},

	/**
	 * Unsets the raw TinyMCE content value
	 */
	resetRawContent: function() {
		Dispatcher.handleViewAction( {
			type: 'RESET_POST_RAW_CONTENT'
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
	 * @param {object} attributes post attributes to change before saving
	 * @param {function} callback receives ( err, post ) arguments
	 * @param {object} options object with optional recordSaveEvent property. True if you want to record the save event.
	 */
	saveEdited: function( attributes, callback, options ) {
		var post, postHandle, query, changedAttributes, rawContent, mode, isNew;

		Dispatcher.handleViewAction( {
			type: 'EDIT_POST',
			post: attributes
		} );

		post = PostEditStore.get();

		// Don't send a request to the API if the post has no content (title,
		// content, or excerpt). A post without content is invalid.
		if ( ! PostEditStore.hasContent() ) {
			defer( callback, new Error( 'NO_CONTENT' ), post );
			return;
		}

		// Prevent saving post if another module has blocked saving.
		if ( PostEditStore.isSaveBlocked() ) {
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
			type: 'EDIT_POST_SAVE'
		} );

		postHandle = wpcom.site( post.site_ID ).post( post.ID );
		query = {
			context: 'edit',
			apiVersion: '1.2'
		};

		if ( ! options || options.recordSaveEvent !== false ) {
			stats.recordSaveEvent(); // do this before changing status from 'future'
		}

		if ( ( changedAttributes && changedAttributes.status === 'future' && utils.isFutureDated( post ) ) ||
			( changedAttributes && changedAttributes.status === 'publish' && utils.isBackDated( post ) )
		) {
			// HACK: This is necessary because for some reason v1.1 and v1.2 of the update post endpoints
			// don't accept a status of 'future' under any conditions.
			// We also need to make sure that we send the date so that the post isn't published.

			// HACK^2: If a post is back-dated, we must also pass in the date, otherwise the API resets the date
			// here /public.api/rest/json-endpoints/class.wpcom-json-api-update-post-v1-2-endpoint.php#L102
			changedAttributes = assign( {}, changedAttributes, {
				status: 'publish',
				date: post.date
			} );
		}

		postHandle[ isNew ? 'add' : 'update' ]( query, changedAttributes, function( error, data ) {
			var original, currentMode;

			currentMode = PreferencesStore.get( 'editor-mode' );

			if ( ! error ) {
				original = PostsStore.get( data.global_ID );
			}

			Dispatcher.handleServerAction( {
				type: 'RECEIVE_POST_BEING_EDITED',
				error: error,
				// Only pass the rawContent if the mode hasn't changed since the request
				// was initiated. Changing the mode re-initializes the rawContent, so we don't want to stomp on
				// it
				rawContent: mode === currentMode ? rawContent : null,
				isNew: isNew,
				original: original,
				post: data
			} );

			callback( error, data );
		} );
	},

	/**
	 * Calls out to API to update Post object with any changed attributes
	 *
	 * @param {object} post to be changed
	 * @param {object} attributes only send the attributes to be changed
	 * @param {function} callback callback receives ( err, post ) arguments
	 */
	update: function( post, attributes, callback ) {
		var postHandle = wpcom.site( post.site_ID ).post( post.ID );

		postHandle.update( attributes, PostActions.receiveUpdate.bind( null, callback ) );
	},

	/**
	 * Sends `delete` request to the API. The first request
	 * updates status to `trash`, the second request deletes the post.
	 *
	 * @param {object} post to be trashed
	 * @param {function} callback that receives ( err, post ) arguments
	 */
	trash: function( post, callback ) {
		var postHandle = wpcom.site( post.site_ID ).post( post.ID );

		postHandle.delete( PostActions.receiveUpdate.bind( null, callback ) );
	},

	/**
	 * Restores post/page from trash
	 *
	 * @param {object} post to be trashed
	 * @param {function} callback that receives ( err, post ) arguments
	 */
	restore: function( post, callback ) {
		var postHandle = wpcom.site( post.site_ID ).post( post.ID );

		postHandle.restore( PostActions.receiveUpdate.bind( null, callback ) );
	},

	queryPosts: function( options, postListStoreId = 'default' ) {
		Dispatcher.handleViewAction( {
			type: 'QUERY_POSTS',
			options: options,
			postListStoreId: postListStoreId
		} );
	},

	/**
	* Fetch next page of posts from the user's sites via the WordPress.com REST API.
	*
	* @api public
	*/
	fetchNextPage: function( postListStoreId = 'default' ) {
		var params, id, siteID, postListStore;

		postListStore = postListStoreFactory( postListStoreId );

		if ( postListStore.isLastPage() || postListStore.isFetchingNextPage() ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: 'FETCH_NEXT_POSTS_PAGE',
			postListStoreId: postListStoreId
		} );

		id = postListStore.getID();
		params = postListStore.getNextPageParams();
		siteID = postListStore.getSiteID();

		if ( siteID ) {
			wpcom
				.site( siteID )
				.postsList( params, PostActions.receivePage.bind( null, id, postListStoreId ) );
		} else {
			wpcom
				.me()
				.postsList( params, PostActions.receivePage.bind( null, id, postListStoreId ) );
		}
	},

	receivePage: function( id, postListStoreId, error, data ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_POSTS_PAGE',
			id: id,
			postListStoreId: postListStoreId,
			error: error,
			data: data
		} );
	},

	fetchUpdated: function( postListStoreId = 'default' ) {
		var id, params, siteID, postListStore;

		postListStore = postListStoreFactory( postListStoreId );

		if ( postListStore.isFetchingNextPage() ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: 'FETCH_UPDATED_POSTS',
			postListStoreId: postListStoreId
		} );

		id = postListStore.getID();
		params = postListStore.getUpdatesParams();
		siteID = postListStore.getSiteID();

		if ( siteID ) {
			debug( 'Fetching posts that have been updated for %s since %s %o', siteID, params.modified_after, params );
			wpcom
				.site( siteID )
				.postsList( params, PostActions.receiveUpdated.bind( null, id, postListStoreId ) );
		} else {
			debug( 'Fetching posts that have been updated since %s %o', params.modified_after, params );
			wpcom
				.me()
				.postsList( params, PostActions.receiveUpdated.bind( null, id, postListStoreId ) );
		}
	},

	receiveUpdated: function( id, postListStoreId, error, data ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_UPDATED_POSTS',
			id: id,
			postListStoreId: postListStoreId,
			error: error,
			data: data
		} );
	},

	receiveUpdate: function( callback, error, data ) {
		var original;

		if ( ! error ) {
			original = PostsStore.get( data.global_ID );
		}

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_UPDATED_POST',
			error: error,
			original: original,
			post: data
		} );
		callback( error, data );
	},

	fetchCounts: function( siteId, options ) {
		Dispatcher.handleViewAction( {
			type: 'FETCH_POST_COUNTS',
			siteId: siteId
		} );

		wpcom.undocumented().site( siteId ).postCounts( options, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_POST_COUNTS',
				error: error,
				data: data,
				siteId: siteId
			} );
		} );
	}
};

module.exports = PostActions;
