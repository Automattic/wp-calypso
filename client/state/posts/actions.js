/** @format */

/**
 * External dependencies
 */
import store from 'store';
import {
	assign,
	clone,
	get,
	includes,
	isEmpty,
	isNumber,
	map,
	pick,
	reduce,
	toArray,
} from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { decodeEntities } from 'lib/formatting';
import PreferencesStore from 'lib/preferences/store';
import {
	POST_DELETE,
	POST_DELETE_SUCCESS,
	POST_DELETE_FAILURE,
	POST_EDIT,
	POST_REQUEST,
	POST_REQUEST_SUCCESS,
	POST_REQUEST_FAILURE,
	POST_RESTORE,
	POST_RESTORE_FAILURE,
	POST_RESTORE_SUCCESS,
	POST_SAVE,
	POST_SAVE_SUCCESS,
	POST_SAVE_FAILURE,
	POSTS_RECEIVE,
	POSTS_REQUEST,
	POSTS_REQUEST_SUCCESS,
	POSTS_REQUEST_FAILURE,
} from 'state/action-types';
import { getSitePost, getEditedPost, getPostEdits, isEditedPostDirty } from 'state/posts/selectors';
import { recordSaveEvent } from 'state/posts/stats';
import {
	getFeaturedImageId,
	isBackDated,
	isFutureDated,
	isPublished,
	normalizePostForApi,
	normalizeTermsForApi,
} from 'state/posts/utils';
import editedPostHasContent from 'state/selectors/edited-post-has-content';
import isPreviousRouteGutenberg from 'state/selectors/is-previous-route-gutenberg';
import {
	startEditingPost,
	startEditingNewPost,
	editorAutosave,
	editorAutosaveReset,
	editorLoadingErrorReset,
	editorReset,
	editorSetLoadingError,
	editorInitRawContent,
	editorSave,
} from 'state/ui/editor/actions';
import {
	getEditorPostId,
	getEditorInitialRawContent,
	getEditorRawContent,
	isEditorSaveBlocked,
} from 'state/ui/editor/selectors';
import { setEditorLastDraft, resetEditorLastDraft } from 'state/ui/editor/last-draft/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Returns an action object to be used in signalling that a post object has
 * been received.
 *
 * @param  {Object}  post       Post received
 * @param  {?String} saveMarker Save marker in the edits log
 * @return {Object}             Action object
 */
export function receivePost( post, saveMarker ) {
	return receivePosts( [ post ], saveMarker );
}

/**
 * Returns an action object to be used in signalling that post objects have
 * been received.
 *
 * @param  {Array}   posts      Posts received
 * @param  {?String} saveMarker Save marker in the edits log
 * @return {Object}             Action object
 */
export function receivePosts( posts, saveMarker ) {
	const action = { type: POSTS_RECEIVE, posts };
	if ( saveMarker ) {
		action.saveMarker = saveMarker;
	}
	return action;
}

/**
 * Triggers a network request to fetch posts for the specified site and query.
 *
 * @param  {Number}   siteId Site ID
 * @param  {String}   query  Post query
 * @return {Function}        Action thunk
 */
export function requestSitePosts( siteId, query = {} ) {
	if ( ! siteId ) {
		return null;
	}

	return requestPosts( siteId, query );
}

/**
 * Returns a function which, when invoked, triggers a network request to fetch
 * posts across all of the current user's sites for the specified query.
 *
 * @param  {String}   query Post query
 * @return {Function}       Action thunk
 */
export function requestAllSitesPosts( query = {} ) {
	return requestPosts( null, query );
}

/**
 * Triggers a network request to fetch posts for the specified site and query.
 *
 * @param  {?Number}  siteId Site ID
 * @param  {String}   query  Post query
 * @return {Function}        Action thunk
 */
function requestPosts( siteId, query = {} ) {
	return dispatch => {
		dispatch( {
			type: POSTS_REQUEST,
			siteId,
			query,
		} );

		const source = siteId ? wpcom.site( siteId ) : wpcom.me();

		return source
			.postsList( { ...query } )
			.then( ( { found, posts } ) => {
				dispatch( receivePosts( posts ) );
				dispatch( {
					type: POSTS_REQUEST_SUCCESS,
					siteId,
					query,
					found,
					posts,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: POSTS_REQUEST_FAILURE,
					siteId,
					query,
					error,
				} );
			} );
	};
}

/**
 * Triggers a network request to fetch a specific post from a site.
 *
 * @param  {Number}   siteId Site ID
 * @param  {Number}   postId Post ID
 * @return {Function}        Action thunk
 */
export function requestSitePost( siteId, postId ) {
	return dispatch => {
		dispatch( {
			type: POST_REQUEST,
			siteId,
			postId,
		} );

		return wpcom
			.site( siteId )
			.post( postId )
			.get()
			.then( post => {
				dispatch( receivePost( post ) );
				dispatch( {
					type: POST_REQUEST_SUCCESS,
					siteId,
					postId,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: POST_REQUEST_FAILURE,
					siteId,
					postId,
					error,
				} );
			} );
	};
}

/**
 * Returns an action object to be used in signalling that the specified
 * post updates should be applied to the set of edits.
 *
 * @param  {Number} siteId Site ID
 * @param  {Number} postId Post ID
 * @param  {Object} post   Post attribute updates
 * @return {Object}        Action object
 */
export function editPost( siteId, postId = null, post ) {
	return {
		type: POST_EDIT,
		post,
		siteId,
		postId,
	};
}

export function updatePostMetadata( siteId, postId = null, metaKey, metaValue ) {
	if ( typeof metaKey === 'string' ) {
		metaKey = { [ metaKey ]: metaValue };
	}

	return {
		type: POST_EDIT,
		siteId,
		postId,
		post: {
			metadata: map( metaKey, ( value, key ) => ( {
				key,
				value,
				operation: 'update',
			} ) ),
		},
	};
}

export function deletePostMetadata( siteId, postId = null, metaKeys ) {
	if ( ! Array.isArray( metaKeys ) ) {
		metaKeys = [ metaKeys ];
	}

	return {
		type: POST_EDIT,
		siteId,
		postId,
		post: {
			metadata: map( metaKeys, key => ( { key, operation: 'delete' } ) ),
		},
	};
}

/**
 * Returns an action object to be used in signalling that a post has been saved
 *
 * @param  {Number}   siteId     Site ID
 * @param  {Number}   postId     Post ID
 * @param  {Object}   savedPost  Updated post
 * @param  {Object}   post       Post attributes
 * @return {Object}              Action thunk
 */
export function savePostSuccess( siteId, postId = null, savedPost, post ) {
	return {
		type: POST_SAVE_SUCCESS,
		siteId,
		postId,
		savedPost,
		post,
	};
}

/**
 * Returns an action thunk which, when dispatched, triggers a network request
 * to save the specified post object.
 *
 * @param  {Number}   siteId Site ID
 * @param  {Number}   postId Post ID
 * @param  {Object}   post   Post attributes
 * @return {Function}        Action thunk
 */
export function savePost( siteId, postId = null, post ) {
	return dispatch => {
		dispatch( {
			type: POST_SAVE,
			siteId,
			postId,
			post,
		} );

		const postHandle = wpcom.site( siteId ).post( postId );
		const normalizedPost = normalizePostForApi( post );
		const method = postId ? 'update' : 'add';
		const saveResult = postHandle[ method ]( { apiVersion: '1.2' }, normalizedPost );

		saveResult.then(
			savedPost => {
				dispatch( savePostSuccess( siteId, postId, savedPost, post ) );
				dispatch( receivePost( savedPost ) );
			},
			error => {
				dispatch( {
					type: POST_SAVE_FAILURE,
					siteId,
					postId,
					error,
				} );
			}
		);

		return saveResult;
	};
}

/**
 * Returns an action thunk which, when dispatched, triggers a network request
 * to trash the specified post.
 *
 * @param  {Number}   siteId Site ID
 * @param  {Number}   postId Post ID
 * @return {Function}        Action thunk
 */
export function trashPost( siteId, postId ) {
	return dispatch => {
		// Trashing post is almost equivalent to saving the post with status field set to `trash`
		// and the action behaves like it was doing exactly that -- it dispatches the `POST_SAVE_*`
		// actions with the right properties.
		//
		// But what we really do is to call the `wpcom.site().post().delete()` method, i.e., sending
		// a `POST /sites/:site/posts/:post/delete` request. The difference is that an explicit delete
		// will set a `_wp_trash_meta_status` meta property on the post and a later `restore` call
		// can restore the original post status, i.e., `publish`. Without this, the post will be always
		// recovered as `draft`.
		const post = { status: 'trash' };

		dispatch( {
			type: POST_SAVE,
			siteId,
			postId,
			post,
		} );

		const trashResult = wpcom
			.site( siteId )
			.post( postId )
			.delete();

		trashResult.then(
			savedPost => {
				dispatch( savePostSuccess( siteId, postId, savedPost, post ) );
				dispatch( receivePost( savedPost ) );
			},
			error => {
				dispatch( {
					type: POST_SAVE_FAILURE,
					siteId,
					postId,
					error,
				} );
			}
		);

		return trashResult;
	};
}

/**
 * Returns an action thunk which, when dispatched, triggers a network request
 * to delete the specified post. The post should already have a status of trash
 * when dispatching this action, else you should use `trashPost`.
 *
 * @param  {Number}   siteId Site ID
 * @param  {Number}   postId Post ID
 * @return {Function}        Action thunk
 */
export function deletePost( siteId, postId ) {
	return dispatch => {
		dispatch( {
			type: POST_DELETE,
			siteId,
			postId,
		} );

		const deleteResult = wpcom
			.site( siteId )
			.post( postId )
			.delete();

		deleteResult.then(
			() => {
				dispatch( {
					type: POST_DELETE_SUCCESS,
					siteId,
					postId,
				} );
			},
			error => {
				dispatch( {
					type: POST_DELETE_FAILURE,
					siteId,
					postId,
					error,
				} );
			}
		);

		return deleteResult;
	};
}

/**
 * Returns an action thunk which, when dispatched, triggers a network request
 * to restore the specified post.
 *
 * @param  {Number}   siteId Site ID
 * @param  {Number}   postId Post ID
 * @return {Function}        Action thunk
 */
export function restorePost( siteId, postId ) {
	return dispatch => {
		dispatch( {
			type: POST_RESTORE,
			siteId,
			postId,
		} );

		const restoreResult = wpcom
			.site( siteId )
			.post( postId )
			.restore();

		restoreResult.then(
			restoredPost => {
				dispatch( {
					type: POST_RESTORE_SUCCESS,
					siteId,
					postId,
				} );
				dispatch( receivePost( restoredPost ) );
			},
			error => {
				dispatch( {
					type: POST_RESTORE_FAILURE,
					siteId,
					postId,
					error,
				} );
			}
		);

		return restoreResult;
	};
}

/**
 * Returns an action thunk which, when dispatched, adds a term to the current edited post
 *
 * @param  {Number}   siteId   Site ID
 * @param  {String}   taxonomy Taxonomy Slug
 * @param  {Object}   term     Object of new term attributes
 * @param  {Number}   postId   ID of post to which term is associated
 * @return {Function}          Action thunk
 */
export function addTermForPost( siteId, taxonomy, term, postId ) {
	return ( dispatch, getState ) => {
		const state = getState();
		const post = getEditedPost( state, siteId, postId );

		// if there is no post, no term, or term is temporary, bail
		if ( ! post || ! term || ! isNumber( term.ID ) ) {
			return;
		}

		const postTerms = post.terms || {};

		// ensure we have an array since API returns an object
		const taxonomyTerms = toArray( postTerms[ taxonomy ] );
		taxonomyTerms.push( term );

		dispatch(
			editPost( siteId, postId, {
				terms: {
					[ taxonomy ]: taxonomyTerms,
				},
			} )
		);
	};
}

function getParentId( post ) {
	if ( ! post || ! post.parent ) {
		return null;
	}

	if ( post.parent.ID ) {
		return post.parent.ID;
	}

	return post.parent;
}

function getPageTemplate( post ) {
	if ( ! post || ! post.page_template || post.page_template === 'default' ) {
		return '';
	}
	return post.page_template;
}

function normalizePost( post ) {
	post.parent_id = getParentId( post );
	if ( post.type === 'page' ) {
		post.page_template = getPageTemplate( post );
	}
	if ( post.title ) {
		post.title = decodeEntities( post.title );
	}

	return post;
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

/**
 * Load an existing post and keep track of edits to it
 *
 * @param {Object} siteId Site ID
 * @param {Number} postId Post ID to load
 * @return {Promise<?Object>} The edited post object
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
		.then( post => {
			post = normalizePost( post );
			dispatch( receivePost( post ) );
			dispatch( editorReset() );
			return post;
		} )
		.catch( error => {
			dispatch( editorSetLoadingError( error ) );
			return null;
		} );
};

export const startEditingPostCopy = ( siteId, postToCopyId ) => dispatch => {
	dispatch( startEditingPost( siteId, null ) );

	wpcom
		.site( siteId )
		.post( postToCopyId )
		.get( { context: 'edit' } )
		.then( postToCopy => {
			const postAttributes = pick( postToCopy, [
				'canonical_image',
				'content',
				'excerpt',
				'format',
				'post_thumbnail',
				'terms',
				'type',
			] );

			postAttributes.title = decodeEntities( postToCopy.title );
			postAttributes.featured_image = getFeaturedImageId( postToCopy );

			/**
			 * A post metadata whitelist for the `updatePostMetadata()` action.
			 *
			 * This is needed because blindly passing all post metadata to `editPost()`
			 * causes unforeseeable issues, such as Publicize not triggering on the copied post.
			 *
			 * @see https://github.com/Automattic/wp-calypso/issues/14840
			 */
			const metadataWhitelist = [ 'geo_latitude', 'geo_longitude', 'geo_address', 'geo_public' ];

			// Filter the post metadata to include only the ones we want to copy,
			// use only the `key` and `value` properties (and, most importantly exclude `id`),
			// and add an `operation` field to the copied values.
			const copiedMetadata = reduce(
				postToCopy.metadata,
				( copiedMeta, { key, value } ) => {
					if ( includes( metadataWhitelist, key ) ) {
						copiedMeta.push( { key, value, operation: 'update' } );
					}
					return copiedMeta;
				},
				[]
			);

			if ( copiedMetadata.length > 0 ) {
				postAttributes.metadata = copiedMetadata;
			}

			dispatch( startEditingNewPost( siteId, postAttributes ) );
		} )
		.catch( error => {
			dispatch( editorSetLoadingError( error ) );
		} );
};

let saveMarkerId = 0;

/*
 * Calls out to API to save a Post object
 *
 * @param {object} options object with optional recordSaveEvent property. True if you want to record the save event.
 */
export const saveEdited = options => async ( dispatch, getState ) => {
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
	const mode = PreferencesStore.get( 'editor-mode' );
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

	const currentMode = PreferencesStore.get( 'editor-mode' );

	dispatch( editorAutosaveReset() );
	dispatch( editorLoadingErrorReset() );

	// Retrieve the normalized post and use it to update Redux store
	const receivedPost = normalizePost( data );

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
