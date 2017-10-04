/**
 * External dependencies
 */
import { isEqual } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory('calypso:posts');

/**
 * Internal dependencies
 */
import utils from './utils';

import Dispatcher from 'dispatcher';

var _posts = {},
	PostsStore;

function setPost( post ) {
	var cachedPost = PostsStore.get( post.global_ID );

	if ( cachedPost && isEqual( post, cachedPost ) ) {
		return;
	}

	_posts[ post.global_ID ] = post;
}

function normalizePost( responseSource, attributes ) {
	const { global_ID } = attributes || {};
	if ( ! global_ID ) {
		debug( 'global_ID is required for a post', attributes );
		return;
	}

	// do not overwrite existing records with localResponse data
	const cachedPost = PostsStore.get( global_ID );
	if ( cachedPost && responseSource === 'local' ) {
		debug( 'existing record (%o), do not overwrite with local response', cachedPost );
		return;
	}

	utils.normalizeSync( attributes, function( error, post ) {
		setPost( post );
	} );
}

function setAll( posts, responseSource ) {
	const boundNormalizePost = normalizePost.bind( null, responseSource );
	posts.forEach( boundNormalizePost );
}

PostsStore = {
	get: function( globalID ) {
		return _posts[ globalID ];
	}
};

PostsStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	switch ( action.type ) {
		case 'RECEIVE_POSTS_PAGE':
		case 'RECEIVE_UPDATED_POSTS':
			if ( ! action.error && action.data.posts ) {
				const responseSource = action.data.__sync && action.data.__sync.responseSource;
				setAll( action.data.posts, responseSource );
			}
			break;

		case 'RECEIVE_UPDATED_POST':
			if ( ! action.error ) {
				normalizePost( 'server', action.post );
			}
			break;
	}
} );

module.exports = PostsStore;
