/**
 * External dependencies
 */
import { isEqual, pick } from 'lodash';

/**
 * Internal dependencies
 */
var Emitter = require( 'lib/mixins/emitter' ),
	Dispatcher = require( 'dispatcher' ),
	utils = require( './utils' ),
	PostsStore = require( './posts-store' );


var _contentImages = {},
	PostContentImagesStore;

function scrapeAll( posts ) {
	posts.forEach( scrapePost );
}
function scrapePost( post ) {
	var imagesFromPost = pick( PostsStore.get( post.global_ID ), 'content_images', 'canonical_image', 'featured_image', 'images', 'global_ID' );
	utils.normalizeAsync( imagesFromPost, function( error, normalizedPostImages ) {
		var cachedImages = PostContentImagesStore.get( normalizedPostImages.global_ID );
		if ( isEqual( normalizedPostImages, cachedImages ) ) {
			return;
		}
		_contentImages[ normalizedPostImages.global_ID ] = normalizedPostImages;
		PostContentImagesStore.emit( 'change' );
	} );
}

PostContentImagesStore = {
	get: function( postGlobalID ) {
		return _contentImages[ postGlobalID ];
	},
	getAll: function() {
		return _contentImages;
	}
};

Emitter( PostContentImagesStore );

PostContentImagesStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	Dispatcher.waitFor( [ PostsStore.dispatchToken ] );

	switch( action.type ) {
		case 'RECEIVE_POSTS_PAGE':
		case 'RECEIVE_UPDATED_POSTS':
			if ( ! action.error && action.data.posts ) {
				scrapeAll( action.data.posts );
			}
			break;
		case 'RECEIVE_UPDATED_POST':
			if ( ! action.error ) {
				scrapePost( action.post );
			}
			break;

	}

} );

module.exports = PostContentImagesStore;
