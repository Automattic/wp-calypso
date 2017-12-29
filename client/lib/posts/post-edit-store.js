/** @format */
/**
 * External dependencies
 */
import { assign, filter, get, isEqual, pickBy, without, omit } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:posts:post-edit-store' );
import emitter from 'lib/mixins/emitter';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import { decodeEntities } from 'lib/formatting';
import { getPreviewURL } from './utils';

/**
 * Module variables
 */
const REGEXP_EMPTY_CONTENT = /^<p>(<br[^>]*>|&nbsp;|\s)*<\/p>$/;
const CONTENT_LENGTH_ASSUME_SET = 50;

let _initialRawContent = null;
let _isAutosaving = false;
let _isLoading = false;
let _saveBlockers = [];
let _isNew = false;
let _loadingError = null;
let _post = null;
let _previewUrl = null;
let _queue = [];
let _queueChanges = false;
let _rawContent = null;
let _savedPost = null;

const PostEditStore = {
	get: function() {
		return _post;
	},

	getSavedPost: function() {
		return _savedPost;
	},

	getRawContent: function() {
		return _rawContent;
	},

	getChangedAttributes: function() {
		if ( this.isNew() ) {
			return _post;
		}

		if ( ! this.isDirty() ) {
			// nothing has changed
			return Object.freeze( {} );
		}

		const changedAttributes = pickBy( _post, function( value, key ) {
			return value !== _savedPost[ key ] && 'metadata' !== key;
		} );

		// exclude metadata which doesn't have any operation set (means it's unchanged)
		if ( _post.metadata ) {
			const metadata = filter( _post.metadata, 'operation' );

			if ( metadata.length ) {
				assign( changedAttributes, { metadata } );
			}
		}

		// when toggling editor modes, it is possible for the post to be dirty
		// even though the content hasn't changed to avoid a confusing UX
		// let's just pass the content through and save it anyway
		if ( ! changedAttributes.content && _rawContent !== _initialRawContent ) {
			changedAttributes.content = _post.content;
		}

		return Object.freeze( changedAttributes );
	},

	getLoadingError: function() {
		return _loadingError;
	},

	isDirty: function() {
		return _post !== _savedPost || _rawContent !== _initialRawContent;
	},

	isNew: function() {
		return _isNew;
	},

	isLoading: function() {
		return _isLoading;
	},

	isAutosaving: function() {
		return _isAutosaving;
	},

	isSaveBlocked: function( key ) {
		if ( ! key ) {
			return !! _saveBlockers.length;
		}

		return -1 !== _saveBlockers.indexOf( key );
	},

	getPreviewUrl: function() {
		return _previewUrl;
	},

	hasContent: function() {
		if ( ! _post ) {
			return false;
		}

		if ( ( _post.title && _post.title.trim() ) || _post.excerpt ) {
			return true;
		}

		if ( _rawContent ) {
			// Raw content contains the most up-to-date post content
			return ! isContentEmpty( _rawContent );
		}

		return ! isContentEmpty( _post.content );
	},
};

function resetState() {
	debug( 'Reset state' );
	_initialRawContent = null;
	_isAutosaving = false;
	_isLoading = false;
	_saveBlockers = [];
	_isNew = false;
	_loadingError = null;
	_post = null;
	_previewUrl = null;
	_queue = [];
	_queueChanges = false;
	_rawContent = null;
	_savedPost = null;
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

function startEditing( site, post ) {
	resetState();
	post = normalize( post );
	if ( post.title ) {
		post.title = decodeEntities( post.title );
	}
	_previewUrl = getPreviewURL( site, post );
	_savedPost = Object.freeze( post );
	_post = _savedPost;
	_isLoading = false;
}

function updatePost( site, post ) {
	post = normalize( post );
	if ( post.title ) {
		post.title = decodeEntities( post.title );
	}
	_previewUrl = getPreviewURL( site, post );
	_savedPost = Object.freeze( post );
	_post = _savedPost;
	_isNew = false;
	_loadingError = null;

	// To ensure that edits made while an update is inflight are not lost, we need to apply them to the updated post.
	_queue.forEach( function( change ) {
		set( change );
	} );
}

function initializeNewPost( site, options ) {
	options = options || {};

	const args = {
		site_ID: get( site, 'ID' ),
		status: 'draft',
		type: options.postType || 'post',
		content: options.content || '',
		title: options.title || '',
	};

	startEditing( site, args );
	_isNew = true;
}

function setLoadingError( error ) {
	resetState();
	_loadingError = error;
	_isLoading = false;
}

function set( attributes ) {
	let updatedPost;

	if ( ! _post ) {
		// ignore since post isn't currently being edited
		return false;
	}

	if ( _queueChanges ) {
		_queue.push( attributes );
	}

	updatedPost = assign( {}, _post, attributes );

	// This prevents an unsaved changes dialogue from appearing
	// on a new post when only the featured image is added then removed.
	// See #17701 for context.
	if ( updatedPost.featured_image === '' && ! _savedPost.featured_image && _post.featured_image ) {
		updatedPost = omit( updatedPost, 'featured_image' );
	}

	updatedPost = normalize( updatedPost );

	if ( ! isEqual( updatedPost, _post ) ) {
		// post has changed, so update
		if ( isEqual( updatedPost, _savedPost ) ) {
			_post = _savedPost;
		} else {
			_post = Object.freeze( updatedPost );
		}

		return true;
	}
	return false;
}

function normalize( post ) {
	post.parent_id = getParentId( post );
	if ( post.type === 'page' ) {
		post.page_template = getPageTemplate( post );
	}
	return post;
}

function setRawContent( content ) {
	if ( null === _initialRawContent ) {
		debug( 'Set initial raw content to: %s', content );
		_initialRawContent = content;
	}

	if ( content !== _rawContent ) {
		const isDirty = PostEditStore.isDirty();
		const hasContent = PostEditStore.hasContent();

		debug( 'Set raw content to: %s', content );
		_rawContent = content;

		if ( PostEditStore.isDirty() !== isDirty || PostEditStore.hasContent() !== hasContent ) {
			PostEditStore.emit( 'change' );
		}
		PostEditStore.emit( 'rawContentChange' );
	}
}

function isContentEmpty( content ) {
	return (
		! content ||
		( content.length < CONTENT_LENGTH_ASSUME_SET && REGEXP_EMPTY_CONTENT.test( content ) )
	);
}

function dispatcherCallback( { action } ) {
	switch ( action.type ) {
		case 'EDIT_POST':
			const changed = set( action.post );
			if ( changed ) {
				PostEditStore.emit( 'change' );
			}
			break;

		case 'RESET_POST_RAW_CONTENT':
			_initialRawContent = null;
			setRawContent( null );
			break;

		case 'EDIT_POST_RAW_CONTENT':
			setRawContent( action.content );
			break;

		case 'DRAFT_NEW_POST':
			initializeNewPost( action.site, {
				postType: action.postType,
				title: action.title,
				content: action.content,
			} );
			PostEditStore.emit( 'change' );
			break;

		case 'START_EDITING_POST':
			resetState();
			_isLoading = true;
			PostEditStore.emit( 'change' );
			break;

		case 'STOP_EDITING_POST':
			resetState();
			PostEditStore.emit( 'change' );
			break;

		case 'RECEIVE_POST_TO_EDIT':
			_isLoading = false;
			if ( action.error ) {
				setLoadingError( action.error );
			} else {
				startEditing( action.site, action.post );
			}
			PostEditStore.emit( 'change' );
			break;

		case 'BLOCK_EDIT_POST_SAVE':
			if ( -1 === _saveBlockers.indexOf( action.key ) ) {
				_saveBlockers.push( action.key );
				PostEditStore.emit( 'change' );
			}
			break;

		case 'UNBLOCK_EDIT_POST_SAVE':
			_saveBlockers = without( _saveBlockers, action.key );
			PostEditStore.emit( 'change' );
			break;

		case 'EDIT_POST_SAVE':
			_queueChanges = true;
			break;

		// called by post changes elsewhere e.g. drafts drawer
		case 'RECEIVE_UPDATED_POST':
			if ( ! action.error ) {
				if ( _post && action.post.ID === _post.ID ) {
					updatePost( action.site, action.post );
					PostEditStore.emit( 'change' );
				}
			}
			_queueChanges = false;
			_queue = [];
			break;

		case 'RECEIVE_POST_BEING_EDITED':
			if ( ! action.error ) {
				updatePost( action.site, action.post );
				if ( typeof action.rawContent === 'string' ) {
					_initialRawContent = action.rawContent;
				}
				PostEditStore.emit( 'change' );
			}
			_queueChanges = false;
			_queue = [];
			break;

		case 'POST_AUTOSAVE':
			_isAutosaving = true;
			PostEditStore.emit( 'change' );
			break;

		case 'RECEIVE_POST_AUTOSAVE':
			_isAutosaving = false;
			if ( ! action.error ) {
				_previewUrl = getPreviewURL(
					action.site,
					assign( { preview_URL: action.autosave.preview_URL }, _savedPost )
				);
			}
			PostEditStore.emit( 'change' );
			break;

		case 'SET_POST_LOADING_ERROR':
			_isLoading = false;
			if ( action.error ) {
				setLoadingError( action.error );
			}
			PostEditStore.emit( 'change' );
			break;
	}
}

emitter( PostEditStore );

PostEditStore.dispatchToken = Dispatcher.register( dispatcherCallback );

export default PostEditStore;
