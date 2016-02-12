/**
 * External dependencies
 */
var isEqual = require( 'lodash/isEqual' ),
	debug = require( 'debug' )( 'calypso:posts' );

/**
 * Internal dependencies
 */
var utils = require( './utils' ),
	Dispatcher = require( 'dispatcher' );

var _posts = {},
	PostsStore;

function setPost( post ) {
	var cachedPost = PostsStore.get( post.global_ID );

	if ( cachedPost && isEqual( post, cachedPost ) ) {
		return;
	}

	_posts[ post.global_ID ] = post;
}

function normalizePost( attributes ) {
	if ( ! attributes.global_ID ) {
		debug( 'global_ID is required for a post' );
		return;
	}

	// these methods are synchronous
	utils.normalizeSync( attributes, function( error, post ) {
		setPost( post );
	} );
}

function setAll( posts ) {
	posts.forEach( normalizePost );
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
				setAll( action.data.posts );
			}
			break;

		case 'RECEIVE_UPDATED_POST':
			if ( ! action.error ) {
				normalizePost( action.post );
			}
			break;
	}
} );

module.exports = PostsStore;
