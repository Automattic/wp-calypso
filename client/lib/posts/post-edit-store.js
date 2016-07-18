/**
 * External dependencies
 */
var assign = require( 'lodash/assign' ),
	debug = require( 'debug' )( 'calypso:posts:post-edit-store' ),
	emitter = require( 'lib/mixins/emitter' ),
	isEqual = require( 'lodash/isEqual' ),
	clone = require( 'lodash/clone' ),
	filter = require( 'lodash/filter' ),
	without = require( 'lodash/without' ),
	map = require( 'lodash/map' ),
	pickBy = require( 'lodash/pickBy' );
import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	decodeEntities = require( 'lib/formatting' ).decodeEntities,
	utils = require( './utils' );

/**
 * Module variables
 */
var REGEXP_EMPTY_CONTENT = /^<p>(<br[^>]*>|&nbsp;|\s)*<\/p>$/,
	CONTENT_LENGTH_ASSUME_SET = 50;

var _initialRawContent = null,
	_isAutosaving = false,
	_isLoading = false,
	_saveBlockers = [],
	_isNew = false,
	_loadingError = null,
	_post = null,
	_previewUrl = null,
	_queue = [],
	_queueChanges = false,
	_rawContent = null,
	_savedPost = null,
	_suggestedSlug = null,
	PostEditStore;

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
	_suggestedSlug = null;
	_savedPost = null;
}

function getSlug( post ) {
	var suggestedSlug = utils.getSuggestedSlug( post );

	if ( ! post ) {
		return null;
	}

	if ( utils.isPublished( post ) ) {
		return post.slug;
	}

	// if the existing post is using the suggested slug, accept the new suggestion
	if ( _savedPost &&
			_savedPost.slug === _suggestedSlug &&
			suggestedSlug
	) {
		return suggestedSlug;
	}

	// loading a draft if no slug is present, use suggestedSlug
	if ( ! _savedPost && ! post.slug && suggestedSlug ) {
		return suggestedSlug;
	}

	return post.slug || null;
}

function getCategoryIds( post ) {
	if ( ! post || ! post.categories ) {
		return;
	}

	return map( post.categories, function( category ) {
		if ( category.ID ) {
			return category.ID;
		}
		return category;
	} );
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

function startEditing( post ) {
	resetState();
	post = normalize( post );
	post.slug = getSlug( post );
	if ( post.title ) {
		post.title = decodeEntities( post.title );
	}
	_previewUrl = utils.getPreviewURL( post );
	_suggestedSlug = utils.getSuggestedSlug( post );
	_savedPost = Object.freeze( post );
	_post = _savedPost;
	_isLoading = false;
}

function updatePost( post ) {
	post = normalize( post );
	post.slug = getSlug( post );
	if ( post.title ) {
		post.title = decodeEntities( post.title );
	}
	_previewUrl = utils.getPreviewURL( post );
	_suggestedSlug = utils.getSuggestedSlug( post );
	_savedPost = Object.freeze( post );
	_post = _savedPost;
	_isNew = false;
	_loadingError = null;

	// To ensure that edits made while an update is inflight are not lost, we need to apply them to the updated post.
	_queue.forEach( function( change ) {
		set( change );
	} );
}

function initializeNewPost( siteId, options ) {
	var args;
	options = options || {};

	args = {
		site_ID: siteId,
		status: 'draft',
		type: options.postType || 'post',
		content: options.content || '',
		title: options.title || ''
	};

	startEditing( args );
	_isNew = true;
}

function setLoadingError( error ) {
	resetState();
	_loadingError = error;
	_isLoading = false;
}

function set( attributes ) {
	var updatedPost;

	if ( ! _post ) {
		// ignore since post isn't currently being edited
		return false;
	}

	if ( _queueChanges ) {
		_queue.push( attributes );
	}

	updatedPost = assign( {}, _post, attributes );
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
	var categoryIds = getCategoryIds( post );
	if ( categoryIds ) {
		post.category_ids = categoryIds;
	}

	post.parent_id = getParentId( post );
	if ( post.type === 'page' ) {
		post.page_template = getPageTemplate( post );
	}
	return post;
}

function setRawContent( content ) {
	var isDirty, hasContent;

	if ( null === _initialRawContent ) {
		debug( 'Set initial raw content to: %s', content );
		_initialRawContent = content;
	}

	if ( content !== _rawContent ) {
		isDirty = PostEditStore.isDirty();
		hasContent = PostEditStore.hasContent();

		debug( 'Set raw content to: %s', content );
		_rawContent = content;

		if ( PostEditStore.isDirty() !== isDirty || PostEditStore.hasContent() !== hasContent ) {
			PostEditStore.emit( 'change' );
		}
		PostEditStore.emit( 'rawContentChange' );
	}
}

function isContentEmpty( content ) {
	return ! content || ( content.length < CONTENT_LENGTH_ASSUME_SET && REGEXP_EMPTY_CONTENT.test( content ) );
}

function receiveCategory( category ) {
	var existingIndex, temporaryId, postCategories;

	if ( ! category ) {
		return;
	}

	postCategories = clone( getCategoryIds( _post ) ) || [];
	temporaryId = category.temporaryId;

	if ( temporaryId ) {
		existingIndex = postCategories.indexOf( temporaryId );
		if ( -1 !== existingIndex ) {
			postCategories.splice( existingIndex, 1, category.ID );
		}
	} else {
		postCategories.push( category.ID );
	}

	set( { categories: postCategories } );
	PostEditStore.emit( 'change' );
}

function dispatcherCallback( payload ) {
	var action = payload.action,
		changed,
		category,
		postId;

	switch ( action.type ) {

		case 'EDIT_POST':
			changed = set( action.post );
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
			initializeNewPost( action.siteId, {
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
				startEditing( action.post );
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
					updatePost( action.post );
					PostEditStore.emit( 'change' );
				}
			}
			_queueChanges = false;
			_queue = [];
			break;

		case 'RECEIVE_POST_BEING_EDITED':
			if ( ! action.error ) {
				updatePost( action.post );
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
				_previewUrl = utils.getPreviewURL( assign( { preview_URL: action.autosave.preview_URL }, _savedPost ) );
			}
			PostEditStore.emit( 'change' );
			break;

		case 'CREATE_TERM':
		case 'RECEIVE_ADD_TERM':
			if ( action.error ||
					! _post ||
					! action.data ||
					! action.siteId ||
					! Array.isArray( action.data.terms ) ||
					! action.data.terms.length ) {
				break;
			}

			category = action.data.terms[ 0 ];
			postId = _post.ID;

			// Only add term if it is a category, siteId matches, and transient postId if present matches _post.ID
			if ( action.siteId !== _post.site_ID ||
					( category.postId && category.postId !== postId ) ||
					action.data.termType !== 'categories' ) {
				break;
			}

			receiveCategory( category );
			break;
	}
}

PostEditStore = {

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
		var changedAttributes,
			metadata;

		if ( this.isNew() ) {
			return _post;
		}

		if ( ! this.isDirty() ) {
			// nothing has changed
			return Object.freeze( {} );
		}

		changedAttributes = pickBy( _post, function( value, key ) {
			return value !== _savedPost[ key ] && 'metadata' !== key;
		} );

		// exclude metadata which doesn't have any operation set (means it's unchanged)
		if ( _post.metadata ) {
			metadata = filter( _post.metadata, 'operation' );

			if ( metadata.length ) {
				assign( changedAttributes, { metadata: metadata } );
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
	}

};

emitter( PostEditStore );

PostEditStore.dispatchToken = Dispatcher.register( dispatcherCallback );

module.exports = PostEditStore;
